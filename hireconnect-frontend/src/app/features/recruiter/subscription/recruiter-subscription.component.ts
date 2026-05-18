import { Component, OnInit, signal } from '@angular/core';
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
  subscriptions = signal<Subscription[]>([]);
  active = signal<Subscription | null>(null);
  loading = signal(true);
  subscribing = signal(false);
  cancelling = signal<number | null>(null);
  renewing = signal<number | null>(null);
  msg = signal('');
  msgType = signal<'success' | 'error'>('success');

  plans = [
    { id: 'FREE',         name: 'Free',         price: 0,    posts: 3,  features: ['3 job posts/month', 'Basic analytics', 'Email support'] },
    { id: 'PROFESSIONAL', name: 'Professional', price: 999,  posts: 25, features: ['25 job posts/month', 'Advanced analytics', 'Priority support', 'Resume download'] },
    { id: 'ENTERPRISE',   name: 'Enterprise',   price: 1999, posts: -1, features: ['Unlimited job posts', 'Full analytics suite', 'Dedicated support', 'Team management', 'Custom branding'] }
  ];

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<ApiResponse<Subscription[]>>('/subscriptions/my').pipe(map(r => r.data || [])).subscribe({
      next: subs => {
        this.subscriptions.set(subs);
        this.loading.set(false);
        this.http.get<ApiResponse<Subscription>>('/subscriptions/my/active').pipe(map(r => r.data)).subscribe({
          next: a => { this.active.set(a); },
          error: () => { this.active.set(null); }
        });
      },
      error: () => { this.loading.set(false); }
    });
  }

  subscribe(plan: string) {
    if (this.subscribing()) return;
    this.subscribing.set(true);
    this.msg.set('');

    this.http.post<ApiResponse<any>>(`/subscriptions/create-order?plan=${plan}`, {}).subscribe({
      next: res => {
        const data = res.data;

        if (data.free) {
          this.msgType.set('success');
          this.msg.set('Free plan activated!');
          this.subscribing.set(false);
          this.load();
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.amount * 100,
          currency: 'INR',
          name: 'HireConnect',
          description: `${plan} Plan — 1 Month`,
          order_id: data.orderId,
          handler: (response: any) => {
            this.http.post<ApiResponse<Subscription>>('/subscriptions/verify-payment', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan: plan
            }).subscribe({
              next: () => {
                this.msgType.set('success');
                this.msg.set(`✅ Payment successful! ${this.planLabel(plan)} plan is now active.`);
                this.subscribing.set(false);
                this.load();
              },
              error: err => {
                this.msgType.set('error');
                this.msg.set(err.error?.message || 'Payment verification failed. Contact support.');
                this.subscribing.set(false);
              }
            });
          },
          prefill: { email: this.auth.getEmail() || '' },
          theme: { color: '#2DD4BF' },
          modal: {
            ondismiss: () => {
              this.subscribing.set(false);
              this.msg.set('Payment cancelled.');
              this.msgType.set('error');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      },
      error: err => {
        this.msgType.set('error');
        this.msg.set(err.error?.message || 'Could not initiate payment');
        this.subscribing.set(false);
      }
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this subscription?')) return;
    this.cancelling.set(id);
    this.http.post<ApiResponse>(`/subscriptions/cancel/${id}`, {}).subscribe({
      next: () => { this.msgType.set('success'); this.msg.set('Subscription cancelled.'); this.cancelling.set(null); this.load(); },
      error: err => { this.msgType.set('error'); this.msg.set(err.error?.message || 'Failed'); this.cancelling.set(null); }
    });
  }

  renew(id: number) {
    this.renewing.set(id);
    this.http.post<ApiResponse>(`/subscriptions/renew/${id}`, {}).subscribe({
      next: () => { this.msgType.set('success'); this.msg.set('Subscription renewed!'); this.renewing.set(null); this.load(); },
      error: err => { this.msgType.set('error'); this.msg.set(err.error?.message || 'Failed'); this.renewing.set(null); }
    });
  }

  isActive(planId: string) { return this.active()?.plan === planId && this.active()?.status === 'ACTIVE'; }
  planPrice(p: number) { return p === 0 ? 'Free' : `₹${p.toLocaleString('en-IN')}/mo`; }
  planLabel(planId: string) { return this.plans.find(p => p.id === planId)?.name || planId; }
}
