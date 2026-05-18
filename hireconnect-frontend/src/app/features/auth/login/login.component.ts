import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.auth.loginWithToken(params['token'], params['email'] || '', params['role'] || 'CANDIDATE');
        this.redirectByRole(params['role'] || 'CANDIDATE');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.value).subscribe({
      next: res => {
        this.redirectByRole(res.role);
      },
      error: err => {
        this.error.set(err.error?.message || 'Invalid email or password. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private redirectByRole(role: string) {
    const r = (role || '').replace(/^ROLE_/, '').toUpperCase();
    if (r === 'ADMIN')          this.router.navigate(['/admin/dashboard']);
    else if (r === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
    else                        this.router.navigate(['/candidate/dashboard']);
  }

  loginWithGitHub() {
    window.location.href = 'http://localhost:8081/oauth2/authorization/github';
  }
}
