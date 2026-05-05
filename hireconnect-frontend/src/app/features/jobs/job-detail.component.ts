import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { timeout, finalize } from 'rxjs/operators';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { Job, CandidateProfile } from '../../core/models';

@Component({
  standalone: false,
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  jobId = 0;
  loading = true;
  applying = false;
  showApplyModal = false;
  coverLetterCtrl = new FormControl('', Validators.required);
  applySuccess = '';
  applyError = '';
  candidateProfile: CandidateProfile | null = null;
  profileChecked = false;
  loadError = '';
  private activeLoadId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobSvc: JobService,
    private appSvc: ApplicationService,
    private profileSvc: ProfileService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const rawId = params.get('id') ?? this.route.parent?.snapshot.paramMap.get('id');
      const id = Number(rawId);
      if (!id || Number.isNaN(id)) {
        this.jobId = 0;
        this.job = null;
        this.loadError = 'Invalid job id.';
        this.loading = false;
        return;
      }

      if (this.jobId === id && (this.job || this.loading)) {
        return;
      }

      if (this.jobId !== id) {
        this.job = null;
      }

      this.jobId = id;
      this.loadCandidateProfile();
      this.loadJob();
    });
  }

  refreshJob() {
    if (!this.jobId) return;
    this.loadJob();
    this.loadCandidateProfile();
  }

  reloadPage() {
    window.location.reload();
  }

  private loadJob() {
    const loadId = ++this.activeLoadId;
    this.loading = !this.job;
    this.loadError = '';

    this.jobSvc.getAllJobs().pipe(
      timeout(5000)
    ).subscribe({
      next: jobs => {
        if (loadId !== this.activeLoadId) return;

        const fallbackJob = jobs.find(j => Number(j.jobId) === this.jobId);
        if (fallbackJob && !this.job) {
          this.job = { ...fallbackJob, skills: fallbackJob.skills || [] };
          this.loading = false;
        }
      }
    });

    this.jobSvc.getJobById(this.jobId).pipe(
      timeout(20000),
      finalize(() => {
        if (loadId === this.activeLoadId && !this.job) {
          this.loading = false;
        }
      })
    ).subscribe({
      next: job => {
        if (loadId !== this.activeLoadId) return;

        this.job = job ? { ...job, skills: job.skills || [] } : null;
        this.loading = false;
      },
      error: (err: any) => {
        if (loadId !== this.activeLoadId) return;

        if (!this.job) {
          this.job = null;
          this.loadError = err?.name === 'TimeoutError'
            ? 'Loading the job took too long. Please try again.'
            : (err.error?.message || 'Failed to load job details.');
        }
      }
    });
  }

  private loadCandidateProfile() {
    this.candidateProfile = null;
    this.profileChecked = false;

    if (this.auth.isCandidate()) {
      this.profileSvc.getCandidateByEmail(this.auth.getEmail()!).subscribe({
        next: p => {
          this.candidateProfile = p;
          this.profileChecked = true;
        },
        error: () => {
          this.profileChecked = true;
        }
      });
    } else {
      this.profileChecked = true;
    }
  }

  openApply() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!this.auth.isCandidate()) {
      return;
    }
    this.showApplyModal = true;
  }

  submitApplication() {
    if (!this.job || this.coverLetterCtrl.invalid) return;
    this.applying = true;
    this.applyError = '';

    this.appSvc.apply({
      jobId: this.job.jobId,
      coverLetter: this.coverLetterCtrl.value || '',
      resumeUrl: this.candidateProfile?.resumeUrl || ''
    }).subscribe({
      next: () => {
        this.applySuccess = 'Application submitted!';
        this.showApplyModal = false;
        this.applying = false;
      },
      error: err => {
        this.applyError = err.error?.message || 'Failed to apply.';
        this.applying = false;
      }
    });
  }

  formatSalary(min: number, max: number) {
    const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${(n / 1000).toFixed(0)}K`;
    return min && max ? `${fmt(min)} - ${fmt(max)} p.a.` : 'Negotiable';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
