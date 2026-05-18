import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { InterviewService } from '../../../core/services/interview-notification.service';
import { Interview, RecruiterProfile } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-candidate-interviews',
  templateUrl: './candidate-interviews.component.html',
  styleUrls: ['./candidate-interviews.component.scss']
})
export class CandidateInterviewsComponent implements OnInit {
  interviews = signal<Interview[]>([]);
  recruiterByAppId = signal<Record<number, RecruiterProfile>>({});
  jobTitleByAppId = signal<Record<number, string>>({});
  loading = signal(true);
  actionMsg = signal('');
  showRescheduleModal = signal(false);
  rescheduleId = signal<number | null>(null);
  rescheduleAt = signal('');
  rescheduling = signal(false);

  constructor(
    private auth: AuthService,
    private profileSvc: ProfileService,
    private appSvc: ApplicationService,
    private jobSvc: JobService,
    private interviewSvc: InterviewService
  ) {}

  ngOnInit() {
    this.loading.set(true);
    this.interviews.set([]);
    this.recruiterByAppId.set({});
    this.jobTitleByAppId.set({});

    this.profileSvc.getCandidateByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.appSvc.getByCandidate(p.profileId).subscribe({
          next: apps => {
            if (apps.length === 0) { this.loading.set(false); return; }
            const relevantApps = apps.filter(a =>
              ['INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED', 'SHORTLISTED'].includes(a.status)
            );
            const appsToCheck = relevantApps.length > 0 ? relevantApps : apps;
            let pending = appsToCheck.length;
            if (pending === 0) { this.loading.set(false); return; }

            const collected: Interview[] = [];
            appsToCheck.forEach(app => {
              this.interviewSvc.getByApplication(app.applicationId).subscribe({
                next: ivs => {
                  collected.push(...ivs);
                  pending--;
                  if (!pending) {
                    const unique = new Map<number, Interview>();
                    collected.forEach(iv => {
                      const current = unique.get(iv.applicationId);
                      if (!current || new Date(iv.scheduledAt).getTime() > new Date(current.scheduledAt).getTime()) {
                        unique.set(iv.applicationId, iv);
                      }
                    });
                    this.interviews.set(
                      Array.from(unique.values()).sort((a, b) =>
                        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
                      )
                    );
                    this.loading.set(false);
                    this.loadRecruiterInfoForInterviews(
                      appsToCheck.reduce((m, a) => { m[a.applicationId] = a.jobId; return m; }, {} as Record<number, number>)
                    );
                  }
                },
                error: () => { pending--; if (!pending) this.loading.set(false); }
              });
            });
          },
          error: () => { this.loading.set(false); }
        });
      },
      error: () => { this.loading.set(false); }
    });
  }

  private loadRecruiterInfoForInterviews(appIdToJobId: Record<number, number>) {
    this.interviews().forEach(iv => {
      const jobId = appIdToJobId[iv.applicationId];
      if (!jobId) return;

      this.jobSvc.getJobById(jobId).subscribe({
        next: job => {
          this.jobTitleByAppId.update(m => ({ ...m, [iv.applicationId]: job.title }));
          if (job.postedBy) {
            this.profileSvc.getRecruiterByEmail(job.postedBy).subscribe({
              next: recruiter => {
                this.recruiterByAppId.update(m => ({ ...m, [iv.applicationId]: recruiter }));
              },
              error: () => {}
            });
          }
        },
        error: () => {}
      });
    });
  }

  confirm(id: number) {
    this.interviewSvc.confirm(id).subscribe({
      next: () => { this.actionMsg.set('✓ Interview confirmed!'); this.patchStatus(id, 'CONFIRMED'); },
      error: err => { this.actionMsg.set(err.error?.message || 'Failed to confirm'); }
    });
  }

  openReschedule(id: number) {
    this.rescheduleId.set(id);
    this.rescheduleAt.set('');
    this.showRescheduleModal.set(true);
  }

  submitReschedule() {
    if (!this.rescheduleId() || !this.rescheduleAt()) return;
    this.rescheduling.set(true);
    const scheduledAt = this.rescheduleAt();
    this.interviewSvc.reschedule(this.rescheduleId()!, scheduledAt).subscribe({
      next: () => {
        this.interviews.update(ivs =>
          ivs.map(iv => iv.interviewId === this.rescheduleId() ? { ...iv, scheduledAt, status: 'RESCHEDULED' } : iv)
        );
        this.actionMsg.set('Interview rescheduled successfully.');
        this.showRescheduleModal.set(false);
        this.rescheduling.set(false);
      },
      error: err => {
        this.actionMsg.set(err.error?.message || 'Failed to reschedule');
        this.rescheduling.set(false);
      }
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this interview?')) return;
    this.interviewSvc.cancel(id).subscribe({
      next: () => { this.actionMsg.set('Interview cancelled.'); this.patchStatus(id, 'CANCELLED'); },
      error: err => { this.actionMsg.set(err.error?.message || 'Failed to cancel'); }
    });
  }

  private patchStatus(id: number, status: string) {
    this.interviews.update(ivs => ivs.map(iv => iv.interviewId === id ? { ...iv, status } : iv));
  }

  statusClass(s: string) {
    const m: Record<string, string> = { SCHEDULED: 'badge-amber', RESCHEDULED: 'badge-navy', CONFIRMED: 'badge-teal', CANCELLED: 'badge-rose', COMPLETED: 'badge-gray' };
    return m[s] || 'badge-gray';
  }

  statusLabel(s: string) {
    const m: Record<string, string> = { SCHEDULED: 'Scheduled', RESCHEDULED: 'Rescheduled', CONFIRMED: 'Confirmed', CANCELLED: 'Cancelled', COMPLETED: 'Completed' };
    return m[s] || s;
  }
}
