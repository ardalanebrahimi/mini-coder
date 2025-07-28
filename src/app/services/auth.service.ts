import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "../../environments/environment";

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

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
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

  logout(): void {
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
}
