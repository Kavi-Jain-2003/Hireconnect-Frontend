import { Component, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { InterviewService } from '../../../core/services/interview-notification.service';
import { Application, Job, CandidateProfile } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-recruiter-applications',
  templateUrl: './recruiter-applications.component.html',
  styleUrls: ['./recruiter-applications.component.scss']
})
export class RecruiterApplicationsComponent implements OnInit {
  jobs = signal<Job[]>([]);
  selectedJobId = signal<number | null>(null);
  apps = signal<Application[]>([]);
  interviewStatusByAppId = signal<Record<number, string>>({});
  candidateByAppId = signal<Record<number, CandidateProfile>>({});
  loading = signal(true);
  appsLoading = signal(false);
  updatingId = signal<number | null>(null);
  showScheduleModal = signal(false);
  scheduleAppId = signal<number | null>(null);
  scheduleForm = signal({ scheduledAt: '', mode: 'Online', meetLink: '', location: '', notes: '' });
  scheduling = signal(false);
  msg = signal('');
  msgType = signal<'success' | 'error'>('success');

  selectedJob = computed(() => this.jobs().find(j => j.jobId === this.selectedJobId()));

  constructor(
    private auth: AuthService, private profileSvc: ProfileService,
    private jobSvc: JobService, private appSvc: ApplicationService,
    private interviewSvc: InterviewService
  ) {}

  private normalizeDateTime(value: string): string {
    if (!value) return value;
    return value.length === 16 ? `${value}:00` : value;
  }

  ngOnInit() {
    this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.jobSvc.getAllJobs().subscribe({
          next: all => {
            this.jobs.set(all.filter(j => j.postedBy === p.email));
            this.loading.set(false);
            const jobs = this.jobs();
            if (jobs.length > 0) this.selectJob(jobs[0].jobId);
          },
          error: () => { this.loading.set(false); }
        });
      },
      error: () => { this.loading.set(false); }
    });
  }

  selectJob(jobId: number) {
    this.selectedJobId.set(jobId);
    this.appsLoading.set(true);
    this.apps.set([]);
    this.candidateByAppId.set({});
    this.appSvc.getByJob(jobId).subscribe({
      next: apps => {
        this.apps.set(apps);
        this.loadInterviewStatuses(apps);
        this.loadCandidateProfiles(apps);
        this.appsLoading.set(false);
      },
      error: () => { this.appsLoading.set(false); }
    });
  }

  private loadCandidateProfiles(apps: Application[]) {
    apps.forEach(app => {
      this.profileSvc.getCandidateById(app.candidateId).subscribe({
        next: profile => {
          this.candidateByAppId.update(m => ({ ...m, [app.applicationId]: profile }));
        },
        error: () => {}
      });
    });
  }

  private loadInterviewStatuses(apps: Application[]) {
    this.interviewStatusByAppId.set({});
    apps.forEach(app => {
      this.interviewSvc.getByApplication(app.applicationId).subscribe({
        next: ivs => {
          const latest = [...ivs].sort((a, b) =>
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          )[0];
          if (latest) {
            this.interviewStatusByAppId.update(m => ({ ...m, [app.applicationId]: latest.status }));
          }
        },
        error: () => {}
      });
    });
  }

  updateStatus(app: Application, status: string) {
    this.updatingId.set(app.applicationId);
    this.msg.set('');
    this.appSvc.updateStatus(app.applicationId, status).subscribe({
      next: () => {
        this.apps.update(apps => apps.map(a => a.applicationId === app.applicationId ? { ...a, status } : a));
        this.updatingId.set(null);
        this.msgType.set('success');
        this.msg.set(`Status updated to ${this.statusLabel(status)}`);
      },
      error: err => {
        this.msgType.set('error');
        this.msg.set(err.error?.message || 'Status update failed');
        this.updatingId.set(null);
      }
    });
  }

  openSchedule(appId: number) {
    this.scheduleAppId.set(appId);
    this.scheduleForm.set({ scheduledAt: '', mode: 'Online', meetLink: '', location: '', notes: '' });
    this.showScheduleModal.set(true);
  }

  scheduleInterview() {
    const appId = this.scheduleAppId();
    const form = this.scheduleForm();
    if (!appId || !form.scheduledAt) return;
    this.scheduling.set(true);
    const app = this.apps().find(a => a.applicationId === appId);

    this.interviewSvc.schedule({
      applicationId: appId,
      scheduledAt: this.normalizeDateTime(form.scheduledAt),
      mode: form.mode,
      meetLink: form.meetLink,
      location: form.location,
      notes: form.notes
    }).subscribe({
      next: () => {
        if (!app) {
          this.showScheduleModal.set(false);
          this.scheduling.set(false);
          this.msgType.set('success');
          this.msg.set('Interview scheduled and candidate notified!');
          return;
        }
        this.appSvc.updateStatus(app.applicationId, 'INTERVIEW_SCHEDULED').subscribe({
          next: () => {
            this.apps.update(apps =>
              apps.map(a => a.applicationId === app.applicationId ? { ...a, status: 'INTERVIEW_SCHEDULED' } : a)
            );
            this.interviewStatusByAppId.update(m => ({ ...m, [app.applicationId]: 'SCHEDULED' }));
            this.showScheduleModal.set(false);
            this.scheduling.set(false);
            this.msgType.set('success');
            this.msg.set('Interview scheduled and candidate notified!');
          },
          error: err => {
            this.scheduling.set(false);
            this.msgType.set('error');
            this.msg.set(err.error?.message || 'Interview saved, but status update failed.');
          }
        });
      },
      error: err => {
        this.msgType.set('error');
        this.msg.set(err.error?.message || 'Failed to schedule interview');
        this.scheduling.set(false);
      }
    });
  }

  offerCandidate(app: Application) {
    if (!this.canOffer(app)) return;
    this.updatingId.set(app.applicationId);
    this.msg.set('');
    this.appSvc.finalizeStatus(app.applicationId, 'OFFERED').subscribe({
      next: () => {
        this.apps.update(apps =>
          apps.map(a => a.applicationId === app.applicationId ? { ...a, status: 'OFFERED' } : a)
        );
        this.updatingId.set(null);
        this.msgType.set('success');
        const candidate = this.candidateByAppId()[app.applicationId];
        const name = candidate?.fullName || 'Candidate';
        this.msg.set(`🎉 ${name} has been offered! They will be notified by email.`);
      },
      error: err => {
        this.updatingId.set(null);
        this.msgType.set('error');
        this.msg.set(err.error?.message || 'Failed to offer candidate');
      }
    });
  }

  rejectCandidate(app: Application) {
    this.updatingId.set(app.applicationId);
    this.msg.set('');
    this.appSvc.finalizeStatus(app.applicationId, 'REJECTED').subscribe({
      next: () => {
        this.apps.update(apps =>
          apps.map(a => a.applicationId === app.applicationId ? { ...a, status: 'REJECTED' } : a)
        );
        this.updatingId.set(null);
        this.msgType.set('success');
        this.msg.set('Application rejected.');
      },
      error: err => {
        this.updatingId.set(null);
        this.msgType.set('error');
        this.msg.set(err.error?.message || 'Failed to reject candidate');
      }
    });
  }

  canOffer(app: Application): boolean {
    return app.status === 'INTERVIEW_SCHEDULED' &&
      this.interviewStatusByAppId()[app.applicationId] === 'CONFIRMED';
  }

  statusClass(s: string) {
    const m: Record<string, string> = { APPLIED: 'badge-navy', SHORTLISTED: 'badge-teal', INTERVIEW_SCHEDULED: 'badge-amber', OFFERED: 'badge-green', REJECTED: 'badge-rose', WITHDRAWN: 'badge-gray' };
    return m[s] || 'badge-gray';
  }

  statusLabel(s: string) {
    const m: Record<string, string> = { APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', INTERVIEW_SCHEDULED: 'Interview Scheduled', OFFERED: 'Offered', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn' };
    return m[s] || s;
  }

  interviewStatusLabel(appId: number): string {
    const status = this.interviewStatusByAppId()[appId];
    if (!status) return 'No interview yet';
    const m: Record<string, string> = { SCHEDULED: 'Scheduled', RESCHEDULED: 'Rescheduled', CONFIRMED: 'Confirmed ✓', CANCELLED: 'Cancelled', COMPLETED: 'Completed' };
    return m[status] || status;
  }

  interviewStatusClass(appId: number): string {
    const status = this.interviewStatusByAppId()[appId];
    const m: Record<string, string> = { SCHEDULED: 'badge-amber', RESCHEDULED: 'badge-navy', CONFIRMED: 'badge-teal', CANCELLED: 'badge-rose', COMPLETED: 'badge-gray' };
    return status ? (m[status] || 'badge-gray') : 'badge-gray';
  }
}
