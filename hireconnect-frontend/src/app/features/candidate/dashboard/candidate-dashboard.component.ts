import { Component, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { CandidateProfile, Application, Job } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-candidate-dashboard',
  templateUrl: './candidate-dashboard.component.html',
  styleUrls: ['./candidate-dashboard.component.scss']
})
export class CandidateDashboardComponent implements OnInit {
  profile = signal<CandidateProfile | null>(null);
  applications = signal<Application[]>([]);
  recentJobs = signal<Job[]>([]);
  loading = signal(true);
  profileMissing = signal(false);

  appliedCount     = computed(() => this.applications().length);
  shortlistedCount = computed(() => this.applications().filter(a => a.status === 'SHORTLISTED').length);
  interviewCount   = computed(() => this.applications().filter(a => a.status === 'INTERVIEW_SCHEDULED').length);
  offeredCount     = computed(() => this.applications().filter(a => a.status === 'OFFERED').length);

  constructor(
    public auth: AuthService,
    private profileSvc: ProfileService,
    private appSvc: ApplicationService,
    private jobSvc: JobService
  ) {}

  ngOnInit() {
    this.jobSvc.getAllJobs().subscribe({
      next: jobs => { this.recentJobs.set(jobs.filter(j => j.status === 'OPEN').slice(0, 4)); },
      error: () => {}
    });
    this.profileSvc.getCandidateByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.profile.set(p);
        this.appSvc.getByCandidate(p.profileId).subscribe({
          next: apps => { this.applications.set(apps); this.loading.set(false); },
          error: () => { this.loading.set(false); }
        });
      },
      error: () => { this.profileMissing.set(true); this.loading.set(false); }
    });
  }

  statusClass(s: string) {
    const m: Record<string, string> = { APPLIED: 'badge-navy', SHORTLISTED: 'badge-teal', INTERVIEW_SCHEDULED: 'badge-amber', OFFERED: 'badge-green', REJECTED: 'badge-rose', WITHDRAWN: 'badge-gray' };
    return m[s] || 'badge-gray';
  }
  statusLabel(s: string) {
    const m: Record<string, string> = { APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', INTERVIEW_SCHEDULED: 'Interview Scheduled', OFFERED: 'Offered', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn' };
    return m[s] || s;
  }
  formatSalary(min: number, max: number) {
    const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(0)}L` : `₹${(n/1000).toFixed(0)}K`;
    return min && max ? `${fmt(min)}–${fmt(max)}` : 'Negotiable';
  }
}
