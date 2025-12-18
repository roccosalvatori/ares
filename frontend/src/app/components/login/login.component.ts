import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginTransitionService } from '../../services/login-transition.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  connectionTestMessage = '';
  connectionTestSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loginTransitionService: LoginTransitionService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    // Check if fields are filled (for admin/admin bypass or normal login)
    if (!this.areFieldsFilled) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.connectionTestMessage = '';

    // Get LDAP URL from localStorage or use empty string (backend can use default)
    const ldapUrl = localStorage.getItem('ldap_url') || '';

    const request: LoginRequest = {
      ldapUrl: ldapUrl,
      username: this.loginForm.value.username?.trim() || '',
      password: this.loginForm.value.password || ''
    };

    console.log('Attempting login with:', { username: request.username, hasPassword: !!request.password });

    this.authService.login(request).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;
        if (response && response.token) {
          this.authService.saveToken(response.token);
          console.log('Token saved, starting transition...');
          
          // Start the transition animation
          this.loginTransitionService.startTransition();
          
          // Navigate immediately (overlay will handle the animation)
          this.router.navigate(['/dashboard']).then(
            () => console.log('Navigation successful'),
            (err) => console.error('Navigation error:', err)
          );
        } else {
          console.error('Invalid response:', response);
          this.errorMessage = 'Invalid response from server';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        // Extract error message from different error formats
        let errorMsg = 'Authentication failed. Please check your credentials.';
        
        if (error.error) {
          // Handle structured error response
          if (error.error.message) {
            errorMsg = error.error.message;
          } else if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error.error) {
            errorMsg = error.error.error;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        // Handle specific HTTP status codes
        if (error.status === 401) {
          errorMsg = 'Invalid username or password. Please try again.';
        } else if (error.status === 403) {
          errorMsg = 'Access denied. Please contact your administrator.';
        } else if (error.status === 0 || error.status === undefined) {
          errorMsg = 'Unable to connect to server. Please check your connection.';
        } else if (error.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.errorMessage = errorMsg;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get areFieldsFilled(): boolean {
    const username = this.loginForm.get('username')?.value || '';
    const password = this.loginForm.get('password')?.value || '';
    return username.trim().length > 0 && password.trim().length > 0;
  }
}

