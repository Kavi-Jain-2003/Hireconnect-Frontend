import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-github-callback',
  template: `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:20px;background:var(--cream)">
      <div class="spinner" style="width:48px;height:48px;border-width:4px"></div>
      <div style="font-size:16px;color:var(--text-muted)">{{message}}</div>
    </div>
  `
})
export class GithubCallbackComponent implements OnInit {
  message = 'Signing you in with GitHub…';

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // The backend OAuth2SuccessHandler writes raw text: "JWT Token: <token>"
    // BUT since it's a full browser redirect (not XHR), the response lands in the browser.
    // The backend should ideally redirect to: http://localhost:4200/auth/github/callback?token=xxx
    // Since the current backend writes raw text, we need to inform the user.
    
    // Check URL params first (if backend redirects with query params)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const role  = params.get('role');

    if (token) {
      this.auth.loginWithToken(token, email || '', role || 'CANDIDATE');
      this.message = '✓ Signed in! Redirecting…';
      const r = role || 'CANDIDATE';
      setTimeout(() => {
        if (r === 'RECRUITER') this.router.navigate(['/recruiter/dashboard']);
        else this.router.navigate(['/candidate/dashboard']);
      }, 800);
    } else {
      // Backend does not redirect yet — show helpful message
      this.message = 'GitHub OAuth is configured but the backend needs to redirect to this page with ?token=... Query. See README for setup.';
    }
  }
}
