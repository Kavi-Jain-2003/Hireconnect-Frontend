import { Component, OnInit } from '@angular/core';
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
  jobs: Job[] = [];
  selectedJobId: number | null = null;
  apps: Application[] = [];
  interviewStatusByAppId: Record<number, string> = {};
  candidateByAppId: Record<number, CandidateProfile> = {};   // ← NEW
  loading = true;
  appsLoading = false;
  updatingId: number | null = null;
  showScheduleModal = false;
  scheduleAppId: number | null = null;
  scheduleForm = { scheduledAt: '', mode: 'Online', meetLink: '', location: '', notes: '' };
  scheduling = false;
  msg = '';
  msgType: 'success' | 'error' = 'success';

  constructor(private auth: AuthService, private profileSvc: ProfileService,
    private jobSvc: JobService, private appSvc: ApplicationService,
    private interviewSvc: InterviewService) {}

  private normalizeDateTime(value: string): string {
    if (!value) return value;
    return value.length === 16 ? `${value}:00` : value;
  }

  ngOnInit() {
    this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.jobSvc.getAllJobs().subscribe({
          next: all => {
            this.jobs = all.filter(j => j.postedBy === p.email);
            this.loading = false;
            if (this.jobs.length > 0) this.selectJob(this.jobs[0].jobId);
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  selectJob(jobId: number) {
    this.selectedJobId = jobId;
    this.appsLoading = true;
    this.apps = [];
    this.candidateByAppId = {};
    this.appSvc.getByJob(jobId).subscribe({
      next: apps => {
        this.apps = apps;
        this.loadInterviewStatuses(apps);
        this.loadCandidateProfiles(apps);   // ← NEW
        this.appsLoading = false;
      },
      error: () => { this.appsLoading = false; }
    });
  }

  // ── NEW: fetch candidate profile for each application ──────────────────────
  private loadCandidateProfiles(apps: Application[]) {
    apps.forEach(app => {
      this.profileSvc.getCandidateById(app.candidateId).subscribe({
        next: profile => {
          this.candidateByAppId = { ...this.candidateByAppId, [app.applicationId]: profile };
        },
        error: () => {}
      });
    });
  }

  private loadInterviewStatuses(apps: Application[]) {
    this.interviewStatusByAppId = {};
    apps.forEach(app => {
      this.interviewSvc.getByApplication(app.applicationId).subscribe({
        next: ivs => {
          const latest = [...ivs].sort((a, b) =>
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          )[0];
          if (latest) {
            this.interviewStatusByAppId = {
              ...this.interviewStatusByAppId,
              [app.applicationId]: latest.status
            };
          }
        },
        error: () => {}
      });
    });
  }

  updateStatus(app: Application, status: string) {
    this.updatingId = app.applicationId;
    this.msg = '';
    this.appSvc.updateStatus(app.applicationId, status).subscribe({
      next: () => {
        this.apps = this.apps.map(a => a.applicationId === app.applicationId ? { ...a, status } : a);
        this.updatingId = null;
        this.msgType = 'success';
        this.msg = `Status updated to ${this.statusLabel(status)}`;
      },
      error: err => {
        this.msgType = 'error';
        this.msg = err.error?.message || 'Status update failed';
        this.updatingId = null;
      }
    });
  }

  openSchedule(appId: number) {
    this.scheduleAppId = appId;
    this.scheduleForm = { scheduledAt: '', mode: 'Online', meetLink: '', location: '', notes: '' };
    this.showScheduleModal = true;
  }

  scheduleInterview() {
    if (!this.scheduleAppId || !this.scheduleForm.scheduledAt) return;
    this.scheduling = true;
    const appId = this.scheduleAppId;
    const app = this.apps.find(a => a.applicationId === appId);

    this.interviewSvc.schedule({
      applicationId: appId,
      scheduledAt: this.normalizeDateTime(this.scheduleForm.scheduledAt),
      mode: this.scheduleForm.mode,
      meetLink: this.scheduleForm.meetLink,
      location: this.scheduleForm.location,
      notes: this.scheduleForm.notes
    }).subscribe({
      next: () => {
        if (!app) {
          this.showScheduleModal = false;
          this.scheduling = false;
          this.msgType = 'success';
          this.msg = 'Interview scheduled and candidate notified!';
          return;
        }
        this.appSvc.updateStatus(app.applicationId, 'INTERVIEW_SCHEDULED').subscribe({
          next: () => {
            this.apps = this.apps.map(a =>
              a.applicationId === app.applicationId ? { ...a, status: 'INTERVIEW_SCHEDULED' } : a
            );
            this.interviewStatusByAppId = { ...this.interviewStatusByAppId, [app.applicationId]: 'SCHEDULED' };
            this.showScheduleModal = false;
            this.scheduling = false;
            this.msgType = 'success';
            this.msg = 'Interview scheduled and candidate notified!';
          },
          error: err => {
            this.scheduling = false;
            this.msgType = 'error';
            this.msg = err.error?.message || 'Interview saved, but status update failed.';
          }
        });
      },
      error: err => {
        this.msgType = 'error';
        this.msg = err.error?.message || 'Failed to schedule interview';
        this.scheduling = false;
      }
    });
  }

  offerCandidate(app: Application) {
    if (!this.canOffer(app)) return;
    this.updatingId = app.applicationId;
    this.msg = '';
    this.appSvc.finalizeStatus(app.applicationId, 'OFFERED').subscribe({
      next: () => {
        this.apps = this.apps.map(a =>
          a.applicationId === app.applicationId ? { ...a, status: 'OFFERED' } : a
        );
        this.updatingId = null;
        this.msgType = 'success';
        const candidate = this.candidateByAppId[app.applicationId];
        const name = candidate?.fullName || 'Candidate';
        this.msg = `🎉 ${name} has been offered! They will be notified by email.`;
      },
      error: err => {
        this.updatingId = null;
        this.msgType = 'error';
        this.msg = err.error?.message || 'Failed to offer candidate';
      }
    });
  }

  rejectCandidate(app: Application) {
    this.updatingId = app.applicationId;
    this.msg = '';
    this.appSvc.finalizeStatus(app.applicationId, 'REJECTED').subscribe({
      next: () => {
        this.apps = this.apps.map(a =>
          a.applicationId === app.applicationId ? { ...a, status: 'REJECTED' } : a
        );
        this.updatingId = null;
        this.msgType = 'success';
        this.msg = 'Application rejected.';
      },
      error: err => {
        this.updatingId = null;
        this.msgType = 'error';
        this.msg = err.error?.message || 'Failed to reject candidate';
      }
    });
  }

  canOffer(app: Application): boolean {
    return app.status === 'INTERVIEW_SCHEDULED' &&
      this.interviewStatusByAppId[app.applicationId] === 'CONFIRMED';
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
    const status = this.interviewStatusByAppId[appId];
    if (!status) return 'No interview yet';
    const m: Record<string, string> = { SCHEDULED: 'Scheduled', RESCHEDULED: 'Rescheduled', CONFIRMED: 'Confirmed ✓', CANCELLED: 'Cancelled', COMPLETED: 'Completed' };
    return m[status] || status;
  }

  interviewStatusClass(appId: number): string {
    const status = this.interviewStatusByAppId[appId];
    const m: Record<string, string> = { SCHEDULED: 'badge-amber', RESCHEDULED: 'badge-navy', CONFIRMED: 'badge-teal', CANCELLED: 'badge-rose', COMPLETED: 'badge-gray' };
    return status ? (m[status] || 'badge-gray') : 'badge-gray';
  }

  get selectedJob() { return this.jobs.find(j => j.jobId === this.selectedJobId); }
}
