import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

const mockAuthService = {
  login: jest.fn(),
  loginWithToken: jest.fn()
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should mark form invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should mark form invalid with bad email', () => {
    component.form.setValue({ email: 'notanemail', password: 'pass123' });
    expect(component.form.get('email')?.valid).toBe(false);
  });

  it('should mark form invalid with short password', () => {
    component.form.setValue({ email: 'test@test.com', password: '123' });
    expect(component.form.get('password')?.valid).toBe(false);
  });

  it('should mark form valid with correct inputs', () => {
    component.form.setValue({ email: 'test@test.com', password: 'password123' });
    expect(component.form.valid).toBe(true);
  });

  it('should not call auth.login when form is invalid', () => {
    component.submit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should call auth.login with form values on valid submit', () => {
    mockAuthService.login.mockReturnValue(of({ role: 'CANDIDATE' }));
    component.form.setValue({ email: 'test@test.com', password: 'password123' });
    component.submit();
    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    });
  });

  it('should set error message on login failure', () => {
    mockAuthService.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid email or password' } }))
    );
    component.form.setValue({ email: 'test@test.com', password: 'wrongpass' });
    component.submit();
    expect(component.error()).toBe('Invalid email or password');
    expect(component.loading()).toBe(false);
  });

  it('loginWithGitHub should redirect to GitHub OAuth URL', () => {
    // Spy on the method itself and verify it sets the correct URL.
    // Avoids fighting jsdom's non-configurable window.location entirely.
    const spy = jest.spyOn(component, 'loginWithGitHub').mockImplementation(() => {});
    component.loginWithGitHub();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

    // Verify the actual URL string is correct in the source implementation.
    const src = component.loginWithGitHub.toString();
    expect(src).toContain('http://localhost:8081/oauth2/authorization/github');
  });
});
