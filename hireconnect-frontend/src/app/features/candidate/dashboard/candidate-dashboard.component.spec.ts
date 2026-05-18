import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CandidateDashboardComponent } from './candidate-dashboard.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';

const mockAuth    = { getEmail: jest.fn().mockReturnValue('cand@test.com') };
const mockProfile = { getCandidateByEmail: jest.fn() };
const mockApp     = { getByCandidate: jest.fn() };
const mockJob     = { getAllJobs: jest.fn() };

const mockCandidateProfile = { profileId: 10, email: 'cand@test.com', fullName: 'John Doe' };

const mockApplications = [
  { applicationId: 1, status: 'APPLIED' },
  { applicationId: 2, status: 'SHORTLISTED' },
  { applicationId: 3, status: 'INTERVIEW_SCHEDULED' },
  { applicationId: 4, status: 'OFFERED' },
  { applicationId: 5, status: 'REJECTED' }
];

const mockJobs = [
  { jobId: 1, status: 'OPEN',   title: 'Dev' },
  { jobId: 2, status: 'OPEN',   title: 'QA' },
  { jobId: 3, status: 'CLOSED', title: 'PM' },
  { jobId: 4, status: 'OPEN',   title: 'Design' },
  { jobId: 5, status: 'OPEN',   title: 'Data' }
];

describe('CandidateDashboardComponent', () => {
  let component: CandidateDashboardComponent;
  let fixture: ComponentFixture<CandidateDashboardComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProfile.getCandidateByEmail.mockReturnValue(of(mockCandidateProfile));
    mockApp.getByCandidate.mockReturnValue(of(mockApplications));
    mockJob.getAllJobs.mockReturnValue(of(mockJobs));

    await TestBed.configureTestingModule({
      declarations: [CandidateDashboardComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService,        useValue: mockAuth },
        { provide: ProfileService,     useValue: mockProfile },
        { provide: ApplicationService, useValue: mockApp },
        { provide: JobService,         useValue: mockJob }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    expect(mockProfile.getCandidateByEmail).toHaveBeenCalledWith('cand@test.com');
    expect(component.profile()).toEqual(mockCandidateProfile);
  });

  it('should load applications', () => {
    expect(component.applications().length).toBe(5);
  });

  it('should count applied correctly', () => {
    expect(component.appliedCount()).toBe(5);
  });

  it('should count shortlisted correctly', () => {
    expect(component.shortlistedCount()).toBe(1);
  });

  it('should count interview scheduled correctly', () => {
    expect(component.interviewCount()).toBe(1);
  });

  it('should count offered correctly', () => {
    expect(component.offeredCount()).toBe(1);
  });

  it('should load only OPEN jobs and max 4', () => {
    // 4 OPEN jobs in mock, only take first 4
    expect(component.recentJobs().length).toBe(4);
    expect(component.recentJobs().every(j => j.status === 'OPEN')).toBe(true);
  });

  it('should set profileMissing when profile not found', () => {
    mockProfile.getCandidateByEmail.mockReturnValue(throwError(() => new Error()));
    fixture = TestBed.createComponent(CandidateDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.profileMissing()).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('statusLabel should return correct label', () => {
    expect(component.statusLabel('APPLIED')).toBe('Applied');
    expect(component.statusLabel('SHORTLISTED')).toBe('Shortlisted');
    expect(component.statusLabel('INTERVIEW_SCHEDULED')).toBe('Interview Scheduled');
    expect(component.statusLabel('OFFERED')).toBe('Offered');
    expect(component.statusLabel('REJECTED')).toBe('Rejected');
  });

  it('formatSalary should format lakhs correctly', () => {
    expect(component.formatSalary(500000, 1000000)).toBe('₹5L–₹10L');
  });

  it('formatSalary should return Negotiable when no range', () => {
    expect(component.formatSalary(0, 0)).toBe('Negotiable');
  });
});
