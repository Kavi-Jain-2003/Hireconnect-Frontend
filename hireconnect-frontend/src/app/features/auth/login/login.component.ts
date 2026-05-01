import { Component, OnInit } from '@angular/core';
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
  loading = false;
  error = '';
  showPassword = false;

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
    // Handle GitHub OAuth callback — token comes as query param ?token=xxx&email=xxx&role=xxx
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.auth.loginWithToken(params['token'], params['email'] || '', params['role'] || 'CANDIDATE');
        const role = params['role'] || 'CANDIDATE';
        if (role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
        else this.router.navigate(['/candidate/dashboard']);
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value).subscribe({
      next: res => {
        if (res.role === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
        else this.router.navigate(['/candidate/dashboard']);
      },
      error: err => {
        this.error = err.error?.message || 'Invalid email or password. Please try again.';
        this.loading = false;
      }
    });
  }

  // GitHub OAuth — goes directly to backend port (not through proxy)
  // because OAuth2 requires browser session cookies, not XHR
  loginWithGitHub() {
    window.location.href = 'http://localhost:8081/oauth2/authorization/github';
  }
}
