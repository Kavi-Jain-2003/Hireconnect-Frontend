import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
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
  loading = true;
  applying = false;
  showApplyModal = false;
  coverLetterCtrl = new FormControl('', Validators.required);
  applySuccess = '';
  applyError = '';
  candidateProfile: CandidateProfile | null = null;
  profileChecked = false;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private jobSvc: JobService, private appSvc: ApplicationService,
    private profileSvc: ProfileService, public auth: AuthService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (!id || isNaN(id)) { this.loading = false; return; }
    // Load job — this is the main call
    this.jobSvc.getJobById(id).subscribe({
      next: job  => { this.job = job ? { ...job, skills: job.skills || [] } : null; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
    // Only try to load candidate profile if logged in as candidate
    if (this.auth.isCandidate()) {
      this.profileSvc.getCandidateByEmail(this.auth.getEmail()!).subscribe({
        next: p  => { this.candidateProfile = p; this.profileChecked = true; },
        error: () => { this.profileChecked = true; } // profile not created yet
      });
    } else {
      this.profileChecked = true;
    }
  }

  openApply() {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    if (!this.auth.isCandidate()) { return; }
    this.showApplyModal = true;
  }

  submitApplication() {
    if (!this.job || this.coverLetterCtrl.invalid) return;
    this.applying = true; this.applyError = '';
    // Backend resolves candidateId from JWT — only send jobId, coverLetter, resumeUrl
    this.appSvc.apply({
      jobId: this.job.jobId,
      coverLetter: this.coverLetterCtrl.value || '',
      resumeUrl: this.candidateProfile?.resumeUrl || ''
    }).subscribe({
      next: ()   => { this.applySuccess = '🎉 Application submitted!'; this.showApplyModal = false; this.applying = false; },
      error: err => { this.applyError = err.error?.message || 'Failed to apply.'; this.applying = false; }
    });
  }

  formatSalary(min: number, max: number) {
    const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(0)}L` : `₹${(n/1000).toFixed(0)}K`;
    return min && max ? `${fmt(min)} – ${fmt(max)} p.a.` : 'Negotiable';
  }
  logout() { this.auth.logout(); this.router.navigate(['/']); }
}
