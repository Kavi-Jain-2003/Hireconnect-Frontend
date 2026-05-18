import { Component, OnInit, signal } from '@angular/core';
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
  job = signal<Job | null>(null);
  jobId = signal(0);
  loading = signal(true);
  applying = signal(false);
  showApplyModal = signal(false);
  coverLetterCtrl = new FormControl('', Validators.required);
  applySuccess = signal('');
  applyError = signal('');
  candidateProfile = signal<CandidateProfile | null>(null);
  profileChecked = signal(false);
  loadError = signal('');
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
        this.jobId.set(0);
        this.job.set(null);
        this.loadError.set('Invalid job id.');
        this.loading.set(false);
        return;
      }

      if (this.jobId() === id && (this.job() || this.loading())) return;
      if (this.jobId() !== id) this.job.set(null);

      this.jobId.set(id);
      this.loadCandidateProfile();
      this.loadJob();
    });
  }

  refreshJob() {
    if (!this.jobId()) return;
    this.loadJob();
    this.loadCandidateProfile();
  }

  reloadPage() { window.location.reload(); }

  private loadJob() {
    const loadId = ++this.activeLoadId;
    this.loading.set(!this.job());
    this.loadError.set('');

    this.jobSvc.getAllJobs().pipe(timeout(5000)).subscribe({
      next: jobs => {
        if (loadId !== this.activeLoadId) return;
        const fallbackJob = jobs.find(j => Number(j.jobId) === this.jobId());
        if (fallbackJob && !this.job()) {
          this.job.set({ ...fallbackJob, skills: fallbackJob.skills || [] });
          this.loading.set(false);
        }
      }
    });

    this.jobSvc.getJobById(this.jobId()).pipe(
      timeout(20000),
      finalize(() => { if (loadId === this.activeLoadId && !this.job()) this.loading.set(false); })
    ).subscribe({
      next: job => {
        if (loadId !== this.activeLoadId) return;
        this.job.set(job ? { ...job, skills: job.skills || [] } : null);
        this.loading.set(false);
      },
      error: (err: any) => {
        if (loadId !== this.activeLoadId) return;
        if (!this.job()) {
          this.job.set(null);
          this.loadError.set(
            err?.name === 'TimeoutError'
              ? 'Loading the job took too long. Please try again.'
              : (err.error?.message || 'Failed to load job details.')
          );
        }
      }
    });
  }

  private loadCandidateProfile() {
    this.candidateProfile.set(null);
    this.profileChecked.set(false);

    if (this.auth.isCandidate()) {
      this.profileSvc.getCandidateByEmail(this.auth.getEmail()!).subscribe({
        next: p => { this.candidateProfile.set(p); this.profileChecked.set(true); },
        error: () => { this.profileChecked.set(true); }
      });
    } else {
      this.profileChecked.set(true);
    }
  }

  openApply() {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    if (!this.auth.isCandidate()) return;
    this.showApplyModal.set(true);
  }

  submitApplication() {
    const job = this.job();
    if (!job || this.coverLetterCtrl.invalid) return;
    this.applying.set(true);
    this.applyError.set('');

    this.appSvc.apply({
      jobId: job.jobId,
      coverLetter: this.coverLetterCtrl.value || '',
      resumeUrl: this.candidateProfile()?.resumeUrl || ''
    }).subscribe({
      next: () => {
        this.applySuccess.set('Application submitted!');
        this.showApplyModal.set(false);
        this.applying.set(false);
      },
      error: err => {
        this.applyError.set(err.error?.message || 'Failed to apply.');
        this.applying.set(false);
      }
    });
  }

  formatSalary(min: number, max: number) {
    const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${(n / 1000).toFixed(0)}K`;
    return min && max ? `${fmt(min)} - ${fmt(max)} p.a.` : 'Negotiable';
  }

  logout() { this.auth.logout(); this.router.navigate(['/']); }
}
