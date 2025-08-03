import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, Subject, take, tap } from "rxjs";
import { environment } from "../../environments/environment";
import {
  AnalyticsService,
  AnalyticsEventType,
  createAnonymizedUserId,
} from "./analytics.service";

interface GoogleAuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
  };
}
declare global {
  interface Window {
    google: any;
  }
}

interface LoginRequest {
  loginField: string; // Can be email or username
  password: string;
}

interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    name?: string;
  };
}

interface AvailabilityRequest {
  username?: string;
  email?: string;
}

interface AvailabilityResponse {
  usernameAvailable?: boolean;
  emailAvailable?: boolean;
}

interface UpdateProfileRequest {
  username?: string;
  email?: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface UpdateProfileResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    tokens: number;
  };
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private googleAuthSubject = new Subject<GoogleAuthResponse>();

  constructor(private http: HttpClient, private analytics: AnalyticsService) {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      const userParsed = JSON.parse(user);
      // You might want to verify the token with the backend
      this.currentUserSubject.next(userParsed);
      this.analytics.setUser(userParsed.id);
    }
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    // Wait for the Google script to be loaded
    if (
      typeof window === "undefined" ||
      !document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      )
    ) {
      // If script is not there, either wait or handle error
      console.error("Google GSI script not found.");
      return;
    }

    // The script is loaded, but window.google might not be ready yet.
    // A timeout helps ensure it's available.
    setTimeout(() => {
      if (!window.google) {
        console.error("window.google not available after timeout.");
        return;
      }
      console.log(
        "Initializing Google Sign-In with client ID:",
        environment.googleClientId
      );
      window.google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          // This callback is now decoupled from the click event.
          // It will notify any active observers via the googleAuthSubject.
          this.handleGoogleAuthCallback(response.credential).subscribe({
            next: (authResponse) => this.googleAuthSubject.next(authResponse),
            error: (error) => this.googleAuthSubject.error(error),
          });
        },
      });
    }, 500); // 500ms delay to ensure script is processed
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);

          // Track login event with anonymized user ID
          const anonymizedId = createAnonymizedUserId(response.user.id);
          this.analytics.setUser(anonymizedId);
          this.analytics.logEvent(AnalyticsEventType.AUTH_LOGIN, {
            authLogin: { success: true, userId: anonymizedId },
          });
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response) => {
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);

          // Track registration and first login
          const anonymizedId = createAnonymizedUserId(response.user.id);
          this.analytics.setUser(anonymizedId);
          this.analytics.logEvent(AnalyticsEventType.AUTH_LOGIN, {
            authLogin: {
              success: true,
              userId: anonymizedId,
              isRegistration: true,
            },
          });
        })
      );
  }

  checkAvailability(
    data: AvailabilityRequest
  ): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(
      `${this.apiUrl}/check-availability`,
      data
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateProfile(data: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http
      .patch<UpdateProfileResponse>(`${this.apiUrl}/profile`, data, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          // Update current user data
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    // Track logout event before clearing user data
    this.analytics.logEvent(AnalyticsEventType.AUTH_LOGOUT, {
      authLogout: { success: true },
    });

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
    // Note: In standalone components, we'll handle navigation in the component
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem("token");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  private getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Google OAuth methods
  googleSignIn(): Observable<GoogleAuthResponse> {
    if (!window.google) {
      this.googleAuthSubject.error("Google Identity Services not available.");
    } else {
      // This just triggers the prompt. The result is handled by the
      // callback defined in the constructor.
      // window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.prompt();
    }
    // The component subscribes to this observable, which will emit
    // once the callback fires. take(1) ensures it completes after one value.
    return this.googleAuthSubject.asObservable().pipe(take(1));
  }

  private handleGoogleAuthCallback(
    token: string
  ): Observable<GoogleAuthResponse> {
    // Handle the callback from Google OAuth
    return this.http
      .post<GoogleAuthResponse>(`${this.apiUrl}/google/callback`, { token })
      .pipe(
        tap((response) => {
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);

          // Track Google login event
          const anonymizedId = createAnonymizedUserId(response.user.id);
          this.analytics.setUser(anonymizedId);
          this.analytics.logEvent(AnalyticsEventType.AUTH_LOGIN, {
            authLogin: {
              success: true,
              userId: anonymizedId,
              provider: "google",
            },
          });
        })
      );
  }
}
