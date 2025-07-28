import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { TranslationService } from '../services/translation.service';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  isEditing = false;
  isChangingPassword = false;
  userProfile: UserProfile | null = null;
  message = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{3,20}$/)]],
      email: ['', [Validators.required, Validators.email]],
      name: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  loadProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          username: profile.username,
          email: profile.email,
          name: profile.name || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile information';
        this.isLoading = false;
      }
    });
  }

  toggleEdit(): void {
    if (this.isEditing) {
      // Cancel editing - reset form
      if (this.userProfile) {
        this.profileForm.patchValue({
          username: this.userProfile.username,
          email: this.userProfile.email,
          name: this.userProfile.name || ''
        });
      }
    }
    this.isEditing = !this.isEditing;
    this.message = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isLoading = true;
    const formValue = this.profileForm.value;

    this.authService.updateProfile(formValue).subscribe({
      next: (response) => {
        this.message = response.message;
        this.userProfile = {
          ...this.userProfile!,
          ...response.user
        };
        this.isEditing = false;
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.error || 'Failed to update profile';
        this.isLoading = false;
      }
    });
  }

  togglePasswordChange(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
    this.message = '';
    this.errorMessage = '';
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.updateProfile({ currentPassword, newPassword }).subscribe({
      next: (response) => {
        this.message = 'Password changed successfully';
        this.passwordForm.reset();
        this.isChangingPassword = false;
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.errorMessage = error.error?.error || 'Failed to change password';
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${this.capitalizeFirst(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern']) {
        return 'Username must be 3-20 characters long and contain only letters, numbers, and underscores';
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 6 characters long';
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Translation methods
  translate(key: string): string {
    return this.translationService.translate(key);
  }

  get availableLanguages() {
    return this.translationService.getAvailableLanguages();
  }

  get selectedLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  changeLanguage(languageCode: string): void {
    this.translationService.setLanguage(languageCode);
  }
}
