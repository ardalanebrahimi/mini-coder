import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "../../environments/environment";
import {
  AnalyticsService,
  AnalyticsEventType,
  createAnonymizedUserId,
} from "./analytics.service";

interface LoginRequest {
  loginField: string; // Can be email or username
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
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

  constructor(private http: HttpClient, private analytics: AnalyticsService) {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      // You might want to verify the token with the backend
      this.currentUserSubject.next({ token });
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem("token", response.token);
          this.currentUserSubject.next(response.user);

          // Track login event with anonymized user ID
          const anonymizedId = createAnonymizedUserId(response.user.email);
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
          this.currentUserSubject.next(response.user);

          // Track registration and first login
          const anonymizedId = createAnonymizedUserId(response.user.email);
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
}
