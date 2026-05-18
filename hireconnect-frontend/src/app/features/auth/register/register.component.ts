import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  success = signal('');
  selectedRole = signal<'CANDIDATE' | 'RECRUITER'>('CANDIDATE');
  showPassword = signal(false);

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role:     ['CANDIDATE', Validators.required]
    });
  }

  selectRole(role: 'CANDIDATE' | 'RECRUITER') {
    this.selectedRole.set(role);
    this.form.patchValue({ role });
  }

  loginWithGitHub() {
    window.location.href = 'http://localhost:8081/oauth2/authorization/github';
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.success.set('✓ Account created! Redirecting to login…');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: err => {
        const msg: string = err.error?.message || '';
        if (msg.toLowerCase().includes('already')) {
          this.error.set('This email is already registered. Please sign in instead.');
        } else {
          this.error.set(msg || 'Registration failed. Please try again.');
        }
        this.loading.set(false);
      }
    });
  }
}
