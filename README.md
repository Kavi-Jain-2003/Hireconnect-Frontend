💼 HireConnect Frontend

Frontend for HireConnect – Job Portal with Recruiter & Candidate Dashboard
This application provides a modern UI for job seekers and recruiters to interact with the platform seamlessly.

🚀 Overview

HireConnect is a full-featured job portal that connects candidates and recruiters through an intuitive web interface.

The frontend enables users to:

Browse and search jobs
Apply for jobs
Manage profiles
Track application status
Handle interviews
Manage recruiter dashboards
🧑‍💻 Tech Stack
Framework: Angular / React (whichever you used — update accordingly)
Styling: CSS / Bootstrap / Tailwind
API Communication: REST APIs (Spring Boot backend)
Authentication: JWT-based authentication
State Management: (Redux / NgRx / Context API – if used)
📁 Project Structure
src/
│── app/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── models/
│   ├── guards/
│   ├── interceptors/
│   └── utils/
│
│── assets/
│── environments/
│── index.html
🔑 Features
👤 Candidate Features
Register & Login
Create and update profile
Upload resume
Search jobs with filters (location, salary, skills)
Apply for jobs
Track application status:
Applied
Shortlisted
Interview Scheduled
Offered / Rejected
View interview schedules
Receive notifications
🧑‍💼 Recruiter Features
Register & Login
Create company profile
Post new jobs
Edit / Delete job listings
View applications
Shortlist / Reject candidates
Schedule interviews
View analytics dashboard
🔔 Notification System
In-app notifications
Email notifications (via backend integration)
Real-time updates for:
Application status
Interview scheduling
Job alerts
🔐 Authentication & Security
JWT-based authentication
Role-based access control:
Candidate
Recruiter
Admin
Protected routes using guards
HTTP interceptors for token handling
🔌 API Integration

Frontend communicates with backend microservices:

Auth Service
Profile Service
Job Service
Application Service
Interview Service
Notification Service
Subscription Service
Analytics Service
⚙️ Setup & Installation
1️⃣ Clone the repository
git clone https://github.com/your-username/hireconnect-frontend.git
cd hireconnect-frontend
2️⃣ Install dependencies
npm install
3️⃣ Configure environment

Update API base URL in:

src/environments/environment.ts

Example:

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
4️⃣ Run the application
ng serve

or (React):

npm start

App will run on:

http://localhost:4200
📸 Key Pages
Home Page (Job Listings)
Login / Register
Candidate Dashboard
Recruiter Dashboard
Job Details Page
Application Tracking Page
Interview Management Page