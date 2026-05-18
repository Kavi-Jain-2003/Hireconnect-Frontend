import { Component, OnInit, signal } from '@angular/core';
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
  profile = signal<CandidateProfile | null>(null);
  form!: FormGroup;
  loading = signal(true);
  saving = signal(false);
  success = signal('');
  error = signal('');
  skillInput = signal('');
  skills = signal<string[]>([]);

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
        this.profile.set(p);
        this.skills.set(p.skills || []);
        this.form.patchValue({
          fullName: p.fullName,
          email: p.email || this.auth.getEmail() || '',
          mobile: p.mobile,
          dob: '',
          gender: '',
          experience: p.experience,
          resumeUrl: p.resumeUrl
        });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
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
    this.success.set('');
    this.error.set('');
    const { email, dob, gender, ...rest } = this.form.value;
    const payload = { ...rest, skills: this.skills() };

    const obs = this.profile()
      ? this.profileSvc.updateCandidateProfile(this.profile()!.profileId, payload)
      : this.profileSvc.createCandidateProfile(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('Profile saved successfully!');
        this.profileSvc.getCandidateByEmail(this.auth.getEmail()!).subscribe({
          next: p => { this.profile.set(p); },
          error: () => {}
        });
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to save profile.');
        this.saving.set(false);
      }
    });
  }
}
