import { Component } from '@angular/core';
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
  loading = false;
  error = '';
  success = '';
  selectedRole: 'CANDIDATE' | 'RECRUITER' = 'CANDIDATE';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role:     ['CANDIDATE', Validators.required]
    });
  }

  selectRole(role: 'CANDIDATE' | 'RECRUITER') {
    this.selectedRole = role;
    this.form.patchValue({ role });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.success = '✓ Account created! Redirecting to login…';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: err => {
        const msg: string = err.error?.message || '';
        if (msg.toLowerCase().includes('already')) {
          this.error = 'This email is already registered. Please sign in instead.';
        } else {
          this.error = msg || 'Registration failed. Please try again.';
        }
        this.loading = false;
      }
    });
  }
}
