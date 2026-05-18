import { Component, OnInit, signal, computed } from '@angular/core';
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
  profile = signal<RecruiterProfile | null>(null);
  jobs = signal<Job[]>([]);
  totalApps = signal(0);
  loading = signal(true);
  profileError = signal(false);

  openJobs  = computed(() => this.jobs().filter(j => j.status === 'OPEN').length);
  totalJobs = computed(() => this.jobs().length);

  constructor(
    public auth: AuthService,
    private profileSvc: ProfileService,
    private jobSvc: JobService,
    private appSvc: ApplicationService
  ) {}

  ngOnInit() {
    this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
      next: profile => {
        this.profile.set(profile);
        this.loadJobs(profile.email);
      },
      error: () => {
        this.profileError.set(true);
        this.loading.set(false);
      }
    });
  }

  private loadJobs(recruiterEmail: string) {
    this.jobSvc.getAllJobs().subscribe({
      next: all => {
        this.jobs.set(all.filter(j => j.postedBy === recruiterEmail));
        this.loading.set(false);
        this.loadAppCounts();
      },
      error: () => { this.loading.set(false); }
    });
  }

  private loadAppCounts() {
    this.jobs().forEach(j => {
      this.appSvc.countByJob(j.jobId).subscribe({
        next: c => { this.totalApps.update(v => v + (c || 0)); },
        error: () => {}
      });
    });
  }

  statusClass(s: string) {
    return s === 'OPEN' ? 'badge-teal' : s === 'PAUSED' ? 'badge-amber' : 'badge-gray';
  }
}
