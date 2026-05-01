import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { RecruiterProfile, Job } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-recruiter-dashboard',
  templateUrl: './recruiter-dashboard.component.html',
  styleUrls: ['./recruiter-dashboard.component.scss']
})
export class RecruiterDashboardComponent implements OnInit {
  profile: RecruiterProfile | null = null;
  jobs: Job[] = [];
  totalApps = 0;
  loading = true;
  profileError = false;

  get openJobs()  { return this.jobs.filter(j => j.status === 'OPEN').length; }
  get totalJobs() { return this.jobs.length; }

  constructor(
    public auth: AuthService,
    private profileSvc: ProfileService,
    private jobSvc: JobService,
    private appSvc: ApplicationService
  ) {}

  ngOnInit() {
    // Load recruiter profile first — email comes from JWT stored in localStorage
    this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
      next: profile => {
        this.profile = profile;
        this.loadJobs(profile.email); // filter by email (postedBy = recruiter email)
      },
      error: () => {
        // Profile doesn't exist yet — still show empty dashboard
        this.profileError = true;
        this.loading = false;
      }
    });
  }

  private loadJobs(recruiterEmail: string) {
    this.jobSvc.getAllJobs().subscribe({
      next: all => {
        // postedBy is the recruiter's email (set by backend from JWT)
        this.jobs = all.filter(j => j.postedBy === recruiterEmail);
        this.loading = false;
        this.loadAppCounts();
      },
      error: () => { this.loading = false; }
    });
  }

  private loadAppCounts() {
    this.jobs.forEach(j => {
      this.appSvc.countByJob(j.jobId).subscribe({
        next: c => { this.totalApps += (c || 0); },
        error: () => {}
      });
    });
  }

  statusClass(s: string) {
    return s === 'OPEN' ? 'badge-teal' : s === 'PAUSED' ? 'badge-amber' : 'badge-gray';
  }
}
