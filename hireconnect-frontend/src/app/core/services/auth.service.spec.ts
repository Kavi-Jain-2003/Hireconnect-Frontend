import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('should store token, email and role on successful login', () => {
      const mockResponse = {
        data: { token: 'mock-jwt-token', email: 'test@test.com', role: 'CANDIDATE' }
      };
      service.login({ email: 'test@test.com', password: 'password123' }).subscribe();
      const req = httpMock.expectOne('/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
      expect(localStorage.getItem('hc_token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('hc_email')).toBe('test@test.com');
      expect(localStorage.getItem('hc_role')).toBe('CANDIDATE');
    });

    it('should strip ROLE_ prefix from role', () => {
      const mockResponse = {
        data: { token: 'tok', email: 'r@r.com', role: 'ROLE_RECRUITER' }
      };
      service.login({ email: 'r@r.com', password: 'pass123' }).subscribe();
      httpMock.expectOne('/auth/login').flush(mockResponse);
      expect(localStorage.getItem('hc_role')).toBe('RECRUITER');
    });

    it('should throw error on failed login', () => {
      let errorMsg = '';
      service.login({ email: 'bad@bad.com', password: 'wrong' }).subscribe({
        error: err => errorMsg = err.error.message
      });
      httpMock.expectOne('/auth/login').flush(
        { message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' }
      );
      expect(errorMsg).toBe('Invalid credentials');
    });
  });

  describe('register()', () => {
    it('should call POST /auth/register', () => {
      service.register({ email: 'new@user.com', password: 'pass123', role: 'CANDIDATE' }).subscribe();
      const req = httpMock.expectOne('/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.role).toBe('CANDIDATE');
      req.flush({ message: 'Registered' });
    });

    it('should throw error when email already exists', () => {
      let errorMsg = '';
      service.register({ email: 'exists@user.com', password: 'pass123', role: 'CANDIDATE' }).subscribe({
        error: err => errorMsg = err.error.message
      });
      httpMock.expectOne('/auth/register').flush(
        { message: 'Email already registered' },
        { status: 409, statusText: 'Conflict' }
      );
      expect(errorMsg).toBe('Email already registered');
    });
  });

  describe('loginWithToken()', () => {
    it('should store token and email from params', () => {
      service.loginWithToken('tok123', 'gh@user.com', 'CANDIDATE');
      expect(localStorage.getItem('hc_token')).toBe('tok123');
      expect(localStorage.getItem('hc_email')).toBe('gh@user.com');
      expect(localStorage.getItem('hc_role')).toBe('CANDIDATE');
    });
  });

  describe('isLoggedIn()', () => {
    it('should return false when no token', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when token exists', () => {
      localStorage.setItem('hc_token', 'some-token');
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('getRole()', () => {
    it('should return role from localStorage', () => {
      localStorage.setItem('hc_role', 'RECRUITER');
      expect(service.getRole()).toBe('RECRUITER');
    });

    it('should return null when not logged in', () => {
      expect(service.getRole()).toBeNull();
    });
  });

  describe('isRecruiter() / isCandidate() / isAdmin()', () => {
    it('should correctly identify RECRUITER', () => {
      localStorage.setItem('hc_role', 'RECRUITER');
      expect(service.isRecruiter()).toBe(true);
      expect(service.isCandidate()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it('should correctly identify CANDIDATE', () => {
      localStorage.setItem('hc_role', 'CANDIDATE');
      expect(service.isCandidate()).toBe(true);
      expect(service.isRecruiter()).toBe(false);
    });

    it('should correctly identify ADMIN', () => {
      localStorage.setItem('hc_role', 'ADMIN');
      expect(service.isAdmin()).toBe(true);
    });
  });

  describe('logout()', () => {
    it('should clear localStorage on logout', () => {
      localStorage.setItem('hc_token', 'tok');
      localStorage.setItem('hc_email', 'e@e.com');
      localStorage.setItem('hc_role', 'CANDIDATE');
      service.logout();
      httpMock.expectOne('/auth/logout').flush({});
      expect(localStorage.getItem('hc_token')).toBeNull();
      expect(localStorage.getItem('hc_email')).toBeNull();
      expect(localStorage.getItem('hc_role')).toBeNull();
    });
  });
});
