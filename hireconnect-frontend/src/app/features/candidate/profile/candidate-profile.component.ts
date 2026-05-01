import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { CandidateProfile } from '../../../core/models';

@Component({
  standalone: false,
  selector: 'app-candidate-profile',
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss']
})
export class CandidateProfileComponent implements OnInit {
  profile: CandidateProfile | null = null;
  form!: FormGroup;
  loading = true;
  saving = false;
  success = '';
  error = '';
  skillInput = '';
  skills: string[] = [];

  constructor(
    private auth: AuthService,
    private profileSvc: ProfileService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      fullName:   ['', Validators.required],
      email:      [''],
      mobile:     ['', Validators.required],
      dob:        [''],
      gender:     [''],
      experience: [0, Validators.min(0)],
      resumeUrl:  ['']
    });

    this.profileSvc.getCandidateByEmail(this.auth.getEmail()!).subscribe({
      next: p => {
        this.profile = p;
        this.skills  = p.skills || [];
        this.form.patchValue({
          fullName: p.fullName,
          email: p.email || this.auth.getEmail() || '',
          mobile: p.mobile,
          dob: '',
          gender: '',
          experience: p.experience,
          resumeUrl: p.resumeUrl
        });
        this.loading = false;
      },
      error: () => { this.loading = false; } // 404 = not created yet, that's OK
    });
  }

  addSkill() {
    const s = this.skillInput.trim();
    if (s && !this.skills.includes(s)) this.skills.push(s);
    this.skillInput = '';
  }

  removeSkill(s: string) { this.skills = this.skills.filter(sk => sk !== s); }

  save() {
    if (this.form.invalid) return;
    this.saving = true; this.success = ''; this.error = '';
    // email is injected from JWT by backend, so we only send the rest
    const { email, dob, gender, ...rest } = this.form.value;
    const payload = { ...rest, skills: this.skills };

    const obs = this.profile
      ? this.profileSvc.updateCandidateProfile(this.profile.profileId, payload)
      : this.profileSvc.createCandidateProfile(payload);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Profile saved successfully!';
        // Reload profile to get latest state
        this.profileSvc.getCandidateByEmail(this.auth.getEmail()!).subscribe({
          next: p => { this.profile = p; },
          error: () => {}
        });
      },
      error: err => {
        this.error = err.error?.message || 'Failed to save profile.';
        this.saving = false;
      }
    });
  }
}
