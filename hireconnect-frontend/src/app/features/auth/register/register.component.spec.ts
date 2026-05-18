import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

const mockAuthService = { register: jest.fn() };

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to CANDIDATE role', () => {
    expect(component.selectedRole()).toBe('CANDIDATE');
    expect(component.form.get('role')?.value).toBe('CANDIDATE');
  });

  it('should switch role to RECRUITER', () => {
    component.selectRole('RECRUITER');
    expect(component.selectedRole()).toBe('RECRUITER');
    expect(component.form.get('role')?.value).toBe('RECRUITER');
  });

  it('should mark form invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should validate email format', () => {
    component.form.patchValue({ email: 'bademail' });
    expect(component.form.get('email')?.valid).toBe(false);
  });

  it('should require password min length 6', () => {
    component.form.patchValue({ password: '123' });
    expect(component.form.get('password')?.valid).toBe(false);
  });

  it('should be valid with correct inputs', () => {
    component.form.setValue({ email: 'new@user.com', password: 'pass123', role: 'CANDIDATE' });
    expect(component.form.valid).toBe(true);
  });

  it('should not call register when form is invalid', () => {
    component.submit();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should call register with form values on valid submit', () => {
    mockAuthService.register.mockReturnValue(of({}));
    component.form.setValue({ email: 'new@user.com', password: 'pass123', role: 'RECRUITER' });
    component.submit();
    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'new@user.com',
      password: 'pass123',
      role: 'RECRUITER'
    });
  });

  it('should show success message after registration', () => {
    mockAuthService.register.mockReturnValue(of({}));
    component.form.setValue({ email: 'new@user.com', password: 'pass123', role: 'CANDIDATE' });
    component.submit();
    expect(component.success()).toContain('Account created');
    expect(component.loading()).toBe(false);
  });

  it('should show "already registered" error for duplicate email', () => {
    mockAuthService.register.mockReturnValue(
      throwError(() => ({ error: { message: 'Email already registered' } }))
    );
    component.form.setValue({ email: 'exists@user.com', password: 'pass123', role: 'CANDIDATE' });
    component.submit();
    expect(component.error()).toContain('already registered');
    expect(component.loading()).toBe(false);
  });

  it('should show generic error on unknown failure', () => {
    mockAuthService.register.mockReturnValue(
      throwError(() => ({ error: { message: 'Server error' } }))
    );
    component.form.setValue({ email: 'new@user.com', password: 'pass123', role: 'CANDIDATE' });
    component.submit();
    expect(component.error()).toBe('Server error');
  });
});
