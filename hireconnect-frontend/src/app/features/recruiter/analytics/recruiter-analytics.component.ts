import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AnalyticsSummary } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-recruiter-analytics',
  templateUrl: './recruiter-analytics.component.html',
  styleUrls: ['./recruiter-analytics.component.scss']
})
export class RecruiterAnalyticsComponent implements OnInit {
  summary = signal<AnalyticsSummary | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private auth: AuthService,
    private profileSvc: ProfileService,
    private analyticsSvc: AnalyticsService
  ) {}

  ngOnInit() {
    this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.analyticsSvc.getRecruiterStats(p.profileId).subscribe({
          next: s => { this.summary.set(s); this.loading.set(false); },
          error: () => { this.loading.set(false); this.error.set('Could not load analytics.'); }
        });
      },
      error: () => { this.loading.set(false); this.error.set('Profile not found.'); }
    });
  }

  pct(val: number, total: number) {
    return total ? Math.round((val / total) * 100) : 0;
  }
}
