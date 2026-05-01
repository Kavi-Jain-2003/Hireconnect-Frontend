import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { JobService } from '../../../core/services/job.service';
import { Job, JobRequest, RecruiterProfile } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-recruiter-jobs',
  templateUrl: './recruiter-jobs.component.html',
  styleUrls: ['./recruiter-jobs.component.scss']
})
export class RecruiterJobsComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;
  showModal = false;
  editing: Job | null = null;
  form!: FormGroup;
  saving = false;
  msg = '';
  msgType: 'success' | 'error' = 'success';
  skillInput = '';
  skills: string[] = [];
  profile: RecruiterProfile | null = null;

  categories = ['IT','Finance','Marketing','HR','Sales','Operations','Design','Engineering'];
  types      = ['Full-time','Part-time','Contract','Internship','Remote'];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private profileSvc: ProfileService,
    private jobSvc: JobService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title:               ['', Validators.required],
      category:            ['', Validators.required],
      type:                ['Full-time', Validators.required],
      location:            ['', Validators.required],
      salaryMin:           [0],
      salaryMax:           [0],
      experienceRequired:  [0],
      description:         [''],
      company:             ['']
    });

    this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.profile = p;
        // Auto-fill company from profile
        this.form.patchValue({ company: p.companyName });
        this.loadJobs(p.email);
      },
      error: () => { this.loading = false; }
    });
  }

  private loadJobs(email: string) {
    this.jobSvc.getAllJobs().subscribe({
      next: all => { this.jobs = all.filter(j => j.postedBy === email); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.editing = null;
    this.skills  = [];
    this.form.reset({
      type: 'Full-time', salaryMin: 0, salaryMax: 0, experienceRequired: 0,
      company: this.profile?.companyName || ''
    });
    this.msg = '';
    this.showModal = true;
  }

  openEdit(job: Job) {
    this.editing = job;
    this.skills  = [...(job.skills || [])];
    this.form.patchValue({
      title: job.title, category: job.category, type: job.type,
      location: job.location, salaryMin: job.salaryMin, salaryMax: job.salaryMax,
      experienceRequired: job.experienceRequired, description: job.description,
      company: job.company
    });
    this.msg = '';
    this.showModal = true;
  }

  addSkill() {
    const s = this.skillInput.trim();
    if (s && !this.skills.includes(s)) this.skills.push(s);
    this.skillInput = '';
  }

  removeSkill(s: string) { this.skills = this.skills.filter(sk => sk !== s); }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.msg = '';

    const req: JobRequest = {
      ...this.form.value,
      skills: this.skills
    };

    const obs = this.editing
      ? this.jobSvc.updateJob(this.editing.jobId, req)
      : this.jobSvc.postJob(req);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.msg = this.editing ? 'Job updated!' : 'Job posted successfully!';
        this.msgType = 'success';
        // Reload jobs from server to get fresh data including jobId
        if (this.profile) this.loadJobs(this.profile.email);
      },
      error: err => {
        this.msgType = 'error';
        this.msg = err.error?.message || 'Failed to save job.';
        this.saving = false;
      }
    });
  }

  changeStatus(job: Job, action: 'pause' | 'close') {
    const obs = action === 'pause' ? this.jobSvc.pauseJob(job.jobId) : this.jobSvc.closeJob(job.jobId);
    obs.subscribe({
      next: () => {
        const status = action === 'pause' ? 'PAUSED' : 'CLOSED';
        this.jobs = this.jobs.map(j => j.jobId === job.jobId ? { ...j, status } : j);
      },
      error: () => {}
    });
  }

  deleteJob(id: number) {
    if (!confirm('Delete this job posting?')) return;
    this.jobSvc.deleteJob(id).subscribe({
      next: () => { this.jobs = this.jobs.filter(j => j.jobId !== id); },
      error: () => {}
    });
  }

  statusClass(s: string) {
    return s === 'OPEN' ? 'badge-teal' : s === 'PAUSED' ? 'badge-amber' : 'badge-gray';
  }
}
