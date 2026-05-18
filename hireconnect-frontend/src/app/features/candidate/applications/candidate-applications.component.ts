import { Component, OnInit, signal, computed } from '@angular/core';
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
  apps = signal<AppRow[]>([]);
  loading = signal(true);
  filterStatus = signal('');
  withdrawingId = signal<number | null>(null);
  error = signal('');

  filtered = computed(() => {
    const status = this.filterStatus();
    return status ? this.apps().filter(a => a.status === status) : this.apps();
  });

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
            this.apps.set([...apps]);
            this.loading.set(false);
            apps.forEach((app, i) => {
              this.jobSvc.getJobById(app.jobId).subscribe({
                next: job => {
                  this.apps.update(current => {
                    const updated = [...current];
                    updated[i] = { ...updated[i], job };
                    return updated;
                  });
                },
                error: () => {}
              });
            });
          },
          error: err => { this.error.set(err.error?.message || 'Failed to load'); this.loading.set(false); }
        });
      },
      error: () => { this.error.set('Profile not found. Please create your profile first.'); this.loading.set(false); }
    });
  }

  withdraw(id: number) {
    if (!confirm('Withdraw this application?')) return;
    this.withdrawingId.set(id);
    this.appSvc.withdraw(id).subscribe({
      next: () => { this.apps.update(apps => apps.filter(a => a.applicationId !== id)); this.withdrawingId.set(null); },
      error: err => { alert(err.error?.message || 'Failed to withdraw'); this.withdrawingId.set(null); }
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
