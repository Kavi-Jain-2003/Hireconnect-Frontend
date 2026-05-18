import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RecruiterProfileComponent } from './recruiter-profile.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';

const mockAuth    = { getEmail: jest.fn().mockReturnValue('rec@test.com') };
const mockProfile = {
  getRecruiterByEmail: jest.fn(),
  updateRecruiterProfile: jest.fn(),
  createRecruiterProfile: jest.fn()
};

const existingProfile = {
  profileId: 1, email: 'rec@test.com', fullName: 'Jane Doe',
  companyName: 'TestCo', companySize: '10-50', industry: 'Tech', website: 'https://test.com'
};

describe('RecruiterProfileComponent', () => {
  let component: RecruiterProfileComponent;
  let fixture: ComponentFixture<RecruiterProfileComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProfile.getRecruiterByEmail.mockReturnValue(of(existingProfile));

    await TestBed.configureTestingModule({
      declarations: [RecruiterProfileComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService,    useValue: mockAuth },
        { provide: ProfileService, useValue: mockProfile }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit — form now includes 'email' control
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and patch form with existing profile', () => {
    expect(component.form.get('fullName')?.value).toBe('Jane Doe');
    expect(component.form.get('companyName')?.value).toBe('TestCo');
    expect(component.form.get('industry')?.value).toBe('Tech');
  });

  it('should set profile on successful load', () => {
    expect(component.profile()).toEqual(existingProfile);
    expect(component.loading()).toBe(false);
  });

  it('should set loading false on profile error', () => {
    mockProfile.getRecruiterByEmail.mockReturnValue(throwError(() => new Error('Not found')));
    fixture = TestBed.createComponent(RecruiterProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.profile()).toBeNull();
  });

  it('should not save when form is invalid', () => {
    component.form.patchValue({ fullName: '', companyName: '' });
    component.save();
    expect(mockProfile.updateRecruiterProfile).not.toHaveBeenCalled();
    expect(mockProfile.createRecruiterProfile).not.toHaveBeenCalled();
  });

  it('should call updateRecruiterProfile when profile exists', () => {
    mockProfile.updateRecruiterProfile.mockReturnValue(of({}));
    mockProfile.getRecruiterByEmail.mockReturnValue(of(existingProfile));
    component.save();
    expect(mockProfile.updateRecruiterProfile).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('should show success message after save', () => {
    mockProfile.updateRecruiterProfile.mockReturnValue(of({}));
    mockProfile.getRecruiterByEmail.mockReturnValue(of(existingProfile));
    component.save();
    expect(component.success()).toBe('Company profile saved!');
    expect(component.saving()).toBe(false);
  });

  it('should show error message on save failure', () => {
    mockProfile.updateRecruiterProfile.mockReturnValue(
      throwError(() => ({ error: { message: 'Save failed' } }))
    );
    component.save();
    expect(component.error()).toBe('Save failed');
    expect(component.saving()).toBe(false);
  });
});
