import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = "";
  usernameChecked = false;
  emailChecked = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        username: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(20),
            Validators.pattern(/^[a-zA-Z0-9_]+$/),
          ],
        ],
        name: ["", [Validators.required, Validators.minLength(2)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError("passwordMismatch")) {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  checkUsernameAvailability(): void {
    const usernameControl = this.registerForm.get("username");
    if (usernameControl?.valid && usernameControl.value) {
      this.authService
        .checkAvailability({ username: usernameControl.value })
        .subscribe({
          next: (response) => {
            if (response.usernameAvailable === false) {
              usernameControl.setErrors({ unavailable: true });
              this.usernameChecked = false;
            } else {
              this.usernameChecked = true;
            }
          },
          error: () => {
            this.usernameChecked = false;
          },
        });
    }
  }

  checkEmailAvailability(): void {
    const emailControl = this.registerForm.get("email");
    if (emailControl?.valid && emailControl.value) {
      this.authService
        .checkAvailability({ email: emailControl.value })
        .subscribe({
          next: (response) => {
            if (response.emailAvailable === false) {
              emailControl.setErrors({ unavailable: true });
              this.emailChecked = false;
            } else {
              this.emailChecked = true;
            }
          },
          error: () => {
            this.emailChecked = false;
          },
        });
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = "";

      const { confirmPassword, ...userData } = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: () => {
          this.router.navigate(["/login"]);
        },
        error: (error) => {
          this.error = error.error?.message || "Registration failed";
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
    }
  }

  get username() {
    return this.registerForm.get("username");
  }
  get name() {
    return this.registerForm.get("name");
  }
  get email() {
    return this.registerForm.get("email");
  }
  get password() {
    return this.registerForm.get("password");
  }
  get confirmPassword() {
    return this.registerForm.get("confirmPassword");
  }
}
