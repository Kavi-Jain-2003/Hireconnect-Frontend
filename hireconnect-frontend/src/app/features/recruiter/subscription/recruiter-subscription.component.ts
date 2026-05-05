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
    { id: 'FREE',         name: 'Free',         price: 0,    posts: 3,  features: ['3 job posts/month', 'Basic analytics', 'Email support'] },
    { id: 'PROFESSIONAL', name: 'Professional', price: 999,  posts: 25, features: ['25 job posts/month', 'Advanced analytics', 'Priority support', 'Resume download'] },
    { id: 'ENTERPRISE',   name: 'Enterprise',   price: 1999, posts: -1, features: ['Unlimited job posts', 'Full analytics suite', 'Dedicated support', 'Team management', 'Custom branding'] }
  ];

  constructor(private http: HttpClient, public auth: AuthService) {}

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
    if (this.subscribing) return;
    this.subscribing = true;
    this.msg = '';

    // Step 1: Create order (or activate FREE directly)
    this.http.post<ApiResponse<any>>(`/subscriptions/create-order?plan=${plan}`, {}).subscribe({
      next: res => {
        const data = res.data;

        // FREE plan — backend activated it directly
        if (data.free) {
          this.msgType = 'success';
          this.msg = 'Free plan activated!';
          this.subscribing = false;
          this.load();
          return;
        }

        // Paid plan — open Razorpay popup
        const options = {
          key: data.keyId,
          amount: data.amount * 100,
          currency: 'INR',
          name: 'HireConnect',
          description: `${plan} Plan — 1 Month`,
          order_id: data.orderId,
          handler: (response: any) => {
            // Step 2: Verify payment with backend
            this.http.post<ApiResponse<Subscription>>('/subscriptions/verify-payment', {
              razorpay_order_id:  response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan
            }).subscribe({
              next: () => {
                this.msgType = 'success';
                this.msg = `✅ Payment successful! ${this.planLabel(plan)} plan is now active.`;
                this.subscribing = false;
                this.load();
              },
              error: err => {
                this.msgType = 'error';
                this.msg = err.error?.message || 'Payment verification failed. Contact support.';
                this.subscribing = false;
              }
            });
          },
          prefill: { email: this.auth.getEmail() || '' },
          theme: { color: '#2DD4BF' },
          modal: {
            ondismiss: () => {
              this.subscribing = false;
              this.msg = 'Payment cancelled.';
              this.msgType = 'error';
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      },
      error: err => {
        this.msgType = 'error';
        this.msg = err.error?.message || 'Could not initiate payment';
        this.subscribing = false;
      }
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this subscription?')) return;
    this.cancelling = id;
    this.http.post<ApiResponse>(`/subscriptions/cancel/${id}`, {}).subscribe({
      next: () => { this.msgType = 'success'; this.msg = 'Subscription cancelled.'; this.cancelling = null; this.load(); },
      error: err => { this.msgType = 'error'; this.msg = err.error?.message || 'Failed'; this.cancelling = null; }
    });
  }

  renew(id: number) {
    this.renewing = id;
    this.http.post<ApiResponse>(`/subscriptions/renew/${id}`, {}).subscribe({
      next: () => { this.msgType = 'success'; this.msg = 'Subscription renewed!'; this.renewing = null; this.load(); },
      error: err => { this.msgType = 'error'; this.msg = err.error?.message || 'Failed'; this.renewing = null; }
    });
  }

  isActive(planId: string) { return this.active?.plan === planId && this.active?.status === 'ACTIVE'; }
  planPrice(p: number) { return p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}/mo`; }
  planLabel(planId: string) { return this.plans.find(p => p.id === planId)?.name || planId; }
}
