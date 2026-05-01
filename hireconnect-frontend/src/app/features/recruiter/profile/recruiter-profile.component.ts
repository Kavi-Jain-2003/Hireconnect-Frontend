import { Component, OnInit } from '@angular/core';
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
  profile: RecruiterProfile | null = null;
  form!: FormGroup;
  loading = true; saving = false; success = ''; error = '';

  constructor(private auth: AuthService, private profileSvc: ProfileService, private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      fullName:    ['', Validators.required],
      companyName: ['', Validators.required],
      companySize: [''],
      industry:    [''],
      website:     ['']
    });

    this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.profile = p;
        this.form.patchValue({ fullName: p.fullName, companyName: p.companyName, companySize: p.companySize, industry: p.industry, website: p.website });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true; this.success = ''; this.error = '';
    // email injected from JWT by backend
    const payload = this.form.value;

    const obs = this.profile
      ? this.profileSvc.updateRecruiterProfile(this.profile.profileId, payload)
      : this.profileSvc.createRecruiterProfile(payload);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Company profile saved!';
        this.profileSvc.getRecruiterByEmail(this.auth.getEmail()!).subscribe({
          next: p => { this.profile = p; }, error: () => {}
        });
      },
      error: err => { this.error = err.error?.message || 'Failed to save.'; this.saving = false; }
    });
  }
}
