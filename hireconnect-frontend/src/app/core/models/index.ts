// ── Auth ─────────────────────────────────────────────
export interface LoginRequest  { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; role: 'CANDIDATE' | 'RECRUITER'; }
export interface LoginResponse { token: string; email: string; role: string; }

// ── Generic API wrapper ───────────────────────────────
export interface ApiResponse<T = any> { message: string; data: T; }

// ── Job (matches Job.java exactly) ───────────────────
export interface Job {
  jobId: number;
  title: string;
  category: string;
  type: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  experienceRequired: number;
  description: string;
  company: string;
  postedBy: string;    // recruiter email from JWT
  status: string;      // OPEN | PAUSED | CLOSED
  postedAt: string;
  viewCount: number;
}

// ── JobRequest (matches JobRequest.java) ─────────────
export interface JobRequest {
  title: string;
  category: string;
  type: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  experienceRequired: number;
  description: string;
  company: string;
}

// ── Application (matches Application.java entity) ─────
export interface Application {
  applicationId: number;
  jobId: number;
  candidateId: number;
  appliedAt: string;
  status: string;        // APPLIED | SHORTLISTED | INTERVIEW_SCHEDULED | OFFERED | REJECTED | WITHDRAWN
  coverLetter: string;
  resumeUrl: string;
}

// ── ApplicationRequest (matches ApplicationRequest.java) ──
export interface ApplicationRequest {
  jobId: number;
  coverLetter: string;
  resumeUrl: string;
}

// ── Profiles ──────────────────────────────────────────
export interface CandidateProfile {
  profileId: number;
  fullName: string;
  email: string;
  mobile: string;
  skills: string[];
  experience: number;
  resumeUrl: string;
}

export interface RecruiterProfile {
  profileId: number;
  fullName: string;
  email: string;
  companyName: string;
  companySize: string;
  industry: string;
  website: string;
}

// ── Interview ─────────────────────────────────────────
export interface Interview {
  interviewId: number;
  applicationId: number;
  scheduledAt: string;
  mode: string;
  meetLink: string;
  location: string;
  status: string;
  notes: string;
}

// ── Notification ──────────────────────────────────────
export interface Notification {
  notificationId: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ── Analytics ─────────────────────────────────────────
export interface AnalyticsSummary {
  totalJobs: number;
  totalApplications: number;
  shortlistedCount: number;
  offeredCount: number;
  rejectedCount: number;
  avgTimeToHireDays: number;
  viewToApplyRatio: number;
}
