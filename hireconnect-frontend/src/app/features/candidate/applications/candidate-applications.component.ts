import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { Application, Job } from '../../../core/models';

interface AppRow extends Application { job?: Job; }

@Component({
  standalone: false,
  selector: 'app-candidate-applications',
  templateUrl: './candidate-applications.component.html',
  styleUrls: ['./candidate-applications.component.scss']
})
export class CandidateApplicationsComponent implements OnInit {
  apps: AppRow[] = [];
  loading = true;
  filterStatus = '';
  withdrawingId: number | null = null;
  error = '';

  STATUS_LABELS: Record<string, string> = {
    APPLIED: 'Applied', SHORTLISTED: 'Shortlisted',
    INTERVIEW_SCHEDULED: 'Interview Scheduled',
    OFFERED: 'Offered', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn'
  };

  constructor(
    private auth: AuthService, private profileSvc: ProfileService,
    private appSvc: ApplicationService, private jobSvc: JobService
  ) {}

  ngOnInit() {
    this.profileSvc.getCandidateByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.appSvc.getByCandidate(p.profileId).subscribe({
          next: apps => {
            this.apps = [...apps];
            this.loading = false;
            apps.forEach((app, i) => {
              this.jobSvc.getJobById(app.jobId).subscribe({
                next: job => { this.apps[i] = { ...this.apps[i], job }; },
                error: () => {}
              });
            });
          },
          error: err => { this.error = err.error?.message || 'Failed to load'; this.loading = false; }
        });
      },
      error: () => { this.error = 'Profile not found. Please create your profile first.'; this.loading = false; }
    });
  }

  get filtered() {
    return this.filterStatus ? this.apps.filter(a => a.status === this.filterStatus) : this.apps;
  }

  withdraw(id: number) {
    if (!confirm('Withdraw this application?')) return;
    this.withdrawingId = id;
    this.appSvc.withdraw(id).subscribe({
      next: () => { this.apps = this.apps.filter(a => a.applicationId !== id); this.withdrawingId = null; },
      error: err => { alert(err.error?.message || 'Failed to withdraw'); this.withdrawingId = null; }
    });
  }

  statusClass(s: string) {
    const m: Record<string, string> = {
      APPLIED: 'badge-navy', SHORTLISTED: 'badge-teal',
      INTERVIEW_SCHEDULED: 'badge-amber', OFFERED: 'badge-green',
      REJECTED: 'badge-rose', WITHDRAWN: 'badge-gray'
    };
    return m[s] || 'badge-gray';
  }

  label(s: string) { return this.STATUS_LABELS[s] || s; }
}
