import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RecruiterDashboardComponent } from './recruiter-dashboard.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';

const mockAuth    = { getEmail: jest.fn().mockReturnValue('rec@test.com') };
const mockProfile = { getRecruiterByEmail: jest.fn() };
const mockJob     = { getAllJobs: jest.fn() };
const mockApp     = { countByJob: jest.fn() };

const mockRecruiterProfile = {
  profileId: 1, email: 'rec@test.com', fullName: 'Test Recruiter',
  companyName: 'TestCo', companySize: '10-50', industry: 'Tech', website: ''
};

const mockJobs = [
  { jobId: 1, title: 'Dev', status: 'OPEN',   postedBy: 'rec@test.com' },
  { jobId: 2, title: 'QA',  status: 'CLOSED', postedBy: 'rec@test.com' },
  { jobId: 3, title: 'PM',  status: 'OPEN',   postedBy: 'other@test.com' }
];

describe('RecruiterDashboardComponent', () => {
  let component: RecruiterDashboardComponent;
  let fixture: ComponentFixture<RecruiterDashboardComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProfile.getRecruiterByEmail.mockReturnValue(of(mockRecruiterProfile));
    mockJob.getAllJobs.mockReturnValue(of(mockJobs));
    mockApp.countByJob.mockReturnValue(of(3));

    await TestBed.configureTestingModule({
      declarations: [RecruiterDashboardComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService,      useValue: mockAuth },
        { provide: ProfileService,   useValue: mockProfile },
        { provide: JobService,       useValue: mockJob },
        { provide: ApplicationService, useValue: mockApp }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recruiter profile on init', () => {
    expect(mockProfile.getRecruiterByEmail).toHaveBeenCalledWith('rec@test.com');
    expect(component.profile()).toEqual(mockRecruiterProfile);
  });

  it('should filter jobs by recruiter email', () => {
    // Only 2 jobs belong to rec@test.com
    expect(component.jobs().length).toBe(2);
  });

  it('should count open jobs correctly', () => {
    expect(component.openJobs()).toBe(1);
  });

  it('should count total jobs correctly', () => {
    expect(component.totalJobs()).toBe(2);
  });

  it('should set loading to false after data loads', () => {
    expect(component.loading()).toBe(false);
  });

  it('should set profileError to true when profile load fails', async () => {
    mockProfile.getRecruiterByEmail.mockReturnValue(throwError(() => new Error('Not found')));
    fixture = TestBed.createComponent(RecruiterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.profileError()).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('statusClass should return correct badge for OPEN', () => {
    expect(component.statusClass('OPEN')).toBe('badge-teal');
  });

  it('statusClass should return badge-amber for PAUSED', () => {
    expect(component.statusClass('PAUSED')).toBe('badge-amber');
  });

  it('statusClass should return badge-gray for CLOSED', () => {
    expect(component.statusClass('CLOSED')).toBe('badge-gray');
  });
});
