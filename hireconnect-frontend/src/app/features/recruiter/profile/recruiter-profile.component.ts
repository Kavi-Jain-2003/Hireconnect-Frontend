import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { RecruiterProfile } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-recruiter-profile',
  templateUrl: './recruiter-profile.component.html',
  styleUrls: ['./recruiter-profile.component.scss']
})
export class RecruiterProfileComponent implements OnInit {
  profile = signal<RecruiterProfile | null>(null);
  form!: FormGroup;
  loading = signal(true);
  saving = signal(false);
  success = signal('');
  error = signal('');

  constructor(private auth: AuthService, private profileSvc: ProfileService, private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      fullName:    ['', Validators.required],
      email:       [''],
      companyName: ['', Validators.required],
      companySize: [''],
      industry:    [''],
      website:     ['']
    });

    this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.profile.set(p);
        this.form.patchValue({ fullName: p.fullName, companyName: p.companyName, companySize: p.companySize, industry: p.industry, website: p.website });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.success.set('');
    this.error.set('');
    const payload = this.form.value;

    const obs = this.profile()
      ? this.profileSvc.updateRecruiterProfile(this.profile()!.profileId, payload)
      : this.profileSvc.createRecruiterProfile(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Company profile saved!');
        this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
          next: p => { this.profile.set(p); }, error: () => {}
        });
      },
      error: err => { this.error.set(err.error?.message || 'Failed to save.'); this.saving.set(false); }
    });
  }
}
