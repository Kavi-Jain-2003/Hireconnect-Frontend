<h1>💼 HireConnect Frontend</h1>

Frontend for HireConnect – Job Portal with Recruiter & Candidate Dashboard
This application provides a modern UI for job seekers and recruiters to interact with the platform seamlessly.

<h1>🚀 Overview</h1>
HireConnect is a full-featured job portal that connects candidates and recruiters through an intuitive web interface.
The frontend enables users to:
<ul>
<li>Browse and search jobs</li>
<li>Apply for jobs</li>
<li>Manage profiles</li>
<li>Track application status</li>
<li>Handle interviews</li>
<li>Manage recruiter dashboards</li>
</ul>

<h1>🧑‍💻 Tech Stack</h1>
<ul>
 <li>Framework: Angular / React (whichever you used — update accordingly)</li>
<li>Styling: CSS / Bootstrap / Tailwind</li>
<li>API Communication: REST APIs (Spring Boot backend)</li>
<li>Authentication: JWT-based authentication</li>
</ul>

```
📁 Project Structure
src/│── app/│   ├── components/│   ├── pages/│   ├── services/│   ├── models/│   ├── guards/│   ├── interceptors/│   └── utils/││── assets/│── environments/│── index.html
```

<h1>🔑 Features</h1>
<ol>
 <li>👤 Candidate Features:</li>
Register & Login
Create and update profile
Upload resume
Search jobs with filters (location, salary, skills)
Apply for jobs
Track application status: Applied, Shortlisted, Interview Scheduled, Offered / Rejected
View interview schedules
Receive notifications

<li>🧑‍💼 Recruiter Features:</li>
Register & Login
Create company profile
Post new jobs
Edit / Delete job listings
View applications
Shortlist / Reject candidates
Schedule interviews
View analytics dashboard

<li>🔔 Notification System:</li>
In-app notifications
Real-time updates for: Application status, Interview scheduling, Job alerts

<li>🔐 Authentication & Security:</li>
JWT-based authentication
Role-based access control: Candidate, Recruiter, Admin
Protected routes using guards
HTTP interceptors for token handling

<li>🔌 API Integration:</li>
Frontend communicates with backend microservices:
Auth Service
Profile Service
Job Service
Application Service
Interview Service
Notification Service
Subscription Service
Analytics Service
</ol>


<h1>📸 Key Pages</h1>
<ul>
<li>Home Page (Job Listings)</li>
<li>Login / Register</li>
<li>Candidate Dashboard</li>
<li>Recruiter Dashboard</li>
<li>Job Details Page</li>
<li>Application Tracking Page</li>
<li>Interview Management Page</li>


