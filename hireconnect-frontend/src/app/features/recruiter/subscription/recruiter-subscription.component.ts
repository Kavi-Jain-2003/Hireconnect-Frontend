import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse } from '../../../core/models';
import { map } from 'rxjs/operators';

interface Subscription {
  subscriptionId: number;
  recruiterId: number;
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  amountPaid: number;
}

@Component({
  standalone: false,
  selector: 'app-recruiter-subscription',
  templateUrl: './recruiter-subscription.component.html',
  styleUrls: ['./recruiter-subscription.component.scss']
})
export class RecruiterSubscriptionComponent implements OnInit {
  subscriptions: Subscription[] = [];
  active: Subscription | null = null;
  loading = true;
  subscribing = false;
  cancelling: number | null = null;
  renewing: number | null = null;
  msg = '';
  msgType: 'success' | 'error' = 'success';

  plans = [
    { id: 'FREE', name: 'Free', price: 0, posts: 3, features: ['3 job posts/month', 'Basic analytics', 'Email support'] },
    { id: 'PROFESSIONAL', name: 'Professional', price: 1999, posts: 25, features: ['25 job posts/month', 'Advanced analytics', 'Priority support', 'Resume download'] },
    { id: 'ENTERPRISE', name: 'Enterprise', price: 4999, posts: -1, features: ['Unlimited job posts', 'Full analytics suite', 'Dedicated support', 'Team management', 'Custom branding'] }
  ];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.http.get<ApiResponse<Subscription[]>>('/subscriptions/my').pipe(map(r => r.data || [])).subscribe({
      next: subs => {
        this.subscriptions = subs;
        this.loading = false;
        this.http.get<ApiResponse<Subscription>>('/subscriptions/my/active').pipe(map(r => r.data)).subscribe({
          next: a => { this.active = a; },
          error: () => { this.active = null; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  subscribe(plan: string) {
    if (!confirm(`Subscribe to ${plan} plan?`)) return;
    this.subscribing = true; this.msg = '';
    this.http.post<ApiResponse>(`/subscriptions/subscribe?plan=${plan}`, {}).subscribe({
      next: () => { this.msgType = 'success'; this.msg = `Subscribed to ${plan} plan!`; this.subscribing = false; this.load(); },
      error: err => { this.msgType = 'error'; this.msg = err.error?.message || 'Subscription failed'; this.subscribing = false; }
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this subscription?')) return;
    this.cancelling = id;
    this.http.post<ApiResponse>(`/subscriptions/cancel/${id}`, {}).subscribe({
      next: () => { this.msg = 'Subscription cancelled.'; this.msgType = 'success'; this.cancelling = null; this.load(); },
      error: err => { this.msg = err.error?.message || 'Failed'; this.msgType = 'error'; this.cancelling = null; }
    });
  }

  renew(id: number) {
    this.renewing = id;
    this.http.post<ApiResponse>(`/subscriptions/renew/${id}`, {}).subscribe({
      next: () => { this.msg = 'Subscription renewed!'; this.msgType = 'success'; this.renewing = null; this.load(); },
      error: err => { this.msg = err.error?.message || 'Failed'; this.msgType = 'error'; this.renewing = null; }
    });
  }

  isActive(planId: string) { return this.active?.plan === planId && this.active?.status === 'ACTIVE'; }
  planPrice(p: number) { return p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}/mo`; }
}
