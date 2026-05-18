import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GithubCallbackComponent } from './github-callback.component';
import { AuthService } from '../../../core/services/auth.service';

const mockAuthService = { loginWithToken: jest.fn() };

describe('GithubCallbackComponent', () => {
  let component: GithubCallbackComponent;
  let fixture: ComponentFixture<GithubCallbackComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      declarations: [GithubCallbackComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(GithubCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show signing in message initially', () => {
    fixture = TestBed.createComponent(GithubCallbackComponent);
    component = fixture.componentInstance;
    expect(component.message).toBe('Signing you in with GitHub…');
  });

  it('should call loginWithToken when token present in URL', () => {
    // Mock URLSearchParams to simulate query params
    const mockParams = new URLSearchParams('token=gh-tok&email=gh@user.com&role=CANDIDATE');
    jest.spyOn(global, 'URLSearchParams').mockImplementation(() => mockParams as any);

    fixture = TestBed.createComponent(GithubCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockAuthService.loginWithToken).toHaveBeenCalledWith('gh-tok', 'gh@user.com', 'CANDIDATE');
    expect(component.message).toBe('✓ Signed in! Redirecting…');

    jest.restoreAllMocks();
  });

  it('should call loginWithToken for RECRUITER role', () => {
    const mockParams = new URLSearchParams('token=gh-tok&email=rec@user.com&role=RECRUITER');
    jest.spyOn(global, 'URLSearchParams').mockImplementation(() => mockParams as any);

    fixture = TestBed.createComponent(GithubCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockAuthService.loginWithToken).toHaveBeenCalledWith('gh-tok', 'rec@user.com', 'RECRUITER');

    jest.restoreAllMocks();
  });

  it('should show error message when no token in URL', () => {
    const mockParams = new URLSearchParams('');
    jest.spyOn(global, 'URLSearchParams').mockImplementation(() => mockParams as any);

    fixture = TestBed.createComponent(GithubCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockAuthService.loginWithToken).not.toHaveBeenCalled();
    expect(component.message).toContain('GitHub OAuth');

    jest.restoreAllMocks();
  });
});
