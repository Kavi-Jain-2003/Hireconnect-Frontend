import { Component, OnInit, signal } from '@angular/core';
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
  jobs = signal<Job[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editing = signal<Job | null>(null);
  form!: FormGroup;
  saving = signal(false);
  msg = signal('');
  msgType = signal<'success' | 'error'>('success');
  skillInput = signal('');
  skills = signal<string[]>([]);
  profile = signal<RecruiterProfile | null>(null);

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
        this.profile.set(p);
        this.form.patchValue({ company: p.companyName });
        this.loadJobs(p.email);
      },
      error: () => { this.loading.set(false); }
    });
  }

  private loadJobs(email: string) {
    this.jobSvc.getAllJobs().subscribe({
      next: all => { this.jobs.set(all.filter(j => j.postedBy === email)); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openNew() {
    this.editing.set(null);
    this.skills.set([]);
    this.form.reset({
      type: 'Full-time', salaryMin: 0, salaryMax: 0, experienceRequired: 0,
      company: this.profile()?.companyName || ''
    });
    this.msg.set('');
    this.showModal.set(true);
  }

  openEdit(job: Job) {
    this.editing.set(job);
    this.skills.set([...(job.skills || [])]);
    this.form.patchValue({
      title: job.title, category: job.category, type: job.type,
      location: job.location, salaryMin: job.salaryMin, salaryMax: job.salaryMax,
      experienceRequired: job.experienceRequired, description: job.description,
      company: job.company
    });
    this.msg.set('');
    this.showModal.set(true);
  }

  addSkill() {
    const s = this.skillInput().trim();
    if (s && !this.skills().includes(s)) this.skills.update(skills => [...skills, s]);
    this.skillInput.set('');
  }

  removeSkill(s: string) { this.skills.update(skills => skills.filter(sk => sk !== s)); }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.msg.set('');

    const req: JobRequest = { ...this.form.value, skills: this.skills() };
    const editingJob = this.editing();

    const obs = editingJob
      ? this.jobSvc.updateJob(editingJob.jobId, req)
      : this.jobSvc.postJob(req);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.msg.set(editingJob ? 'Job updated!' : 'Job posted successfully!');
        this.msgType.set('success');
        const p = this.profile();
        if (p) this.loadJobs(p.email);
      },
      error: err => {
        this.msgType.set('error');
        this.msg.set(err.error?.message || 'Failed to save job.');
        this.saving.set(false);
      }
    });
  }

  changeStatus(job: Job, action: 'pause' | 'close') {
    const obs = action === 'pause' ? this.jobSvc.pauseJob(job.jobId) : this.jobSvc.closeJob(job.jobId);
    obs.subscribe({
      next: () => {
        const status = action === 'pause' ? 'PAUSED' : 'CLOSED';
        this.jobs.update(jobs => jobs.map(j => j.jobId === job.jobId ? { ...j, status } : j));
      },
      error: () => {}
    });
  }

  deleteJob(id: number) {
    if (!confirm('Delete this job posting?')) return;
    this.jobSvc.deleteJob(id).subscribe({
      next: () => { this.jobs.update(jobs => jobs.filter(j => j.jobId !== id)); },
      error: () => {}
    });
  }

  statusClass(s: string) {
    return s === 'OPEN' ? 'badge-teal' : s === 'PAUSED' ? 'badge-amber' : 'badge-gray';
  }
}
