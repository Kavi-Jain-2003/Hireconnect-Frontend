# HireConnect Angular Frontend

A professional Angular 21 frontend for the HireConnect Job Portal.

## Tech Stack
- Angular 21 (NgModule-based, SCSS)
- Angular Router (lazy-loaded modules)
- Reactive Forms + Template-driven Forms
- HTTP Client with JWT Interceptor
- Custom CSS Design System (no Bootstrap/Material)

## Features

### Public
- Landing page with hero, features, featured jobs
- Job listings with search & filter (title, location, category, type)
- Individual job detail page

### Candidate Dashboard
- Dashboard with stats (applied, shortlisted, interviews, offers)
- Browse & apply to jobs with cover letter
- Track application statuses in real-time
- Manage interview schedule (confirm/cancel)
- Create & update candidate profile with skills

### Recruiter Dashboard  
- Dashboard with job & application metrics
- Post, edit, pause, close, delete job listings
- Review applications pipeline per job (shortlist → interview → offer/reject)
- Schedule interviews with Online/In-Person support
- Company profile management
- Hiring analytics (pipeline breakdown, view-to-apply ratio)

## Proxy Configuration (Microservices)

The app uses Angular's dev proxy to route to each backend microservice:

| Route | Backend |
|---|---|
| /auth/* | localhost:8081 (auth-service) |
| /profiles/* | localhost:8083 (profile-service) |
| /jobs/* | localhost:8082 (job-service) |
| /applications/* | localhost:8084 (application-service) |
| /interviews/* | localhost:8085 (interview-service) |
| /notifications/* | localhost:8086 (notification-service) |
| /subscriptions/* | localhost:8087 (subscription-service) |
| /analytics/* | localhost:8088 (analytics-service) |

For production with the API gateway on port 8080, set `apiUrl` in environment files.

## Setup & Run

```bash
# Install dependencies
npm install

# Start dev server (with proxy to microservices)
ng serve --proxy-config proxy.conf.json

# Or use npm start
npm start

# Build for production
ng build --configuration=production
```

App runs at: http://localhost:4200

## Project Structure

```
src/app/
├── core/
│   ├── models/          # TypeScript interfaces
│   ├── services/        # HTTP services for each microservice
│   ├── guards/          # AuthGuard
│   └── interceptors/    # JWT interceptor
├── features/
│   ├── home/            # Landing page
│   ├── auth/            # Login & Register
│   ├── jobs/            # Job listing & detail
│   ├── candidate/       # Candidate dashboard
│   └── recruiter/       # Recruiter dashboard
└── environments/        # Dev/prod config
```

## Design System

Custom CSS variables in `styles.scss`:
- Navy (#0D1B2A) — primary dark
- Teal (#00C9A7) — accent / actions
- Amber (#F4A261) — warnings / recruiter
- Cream (#FAF9F6) — backgrounds
- Playfair Display + DM Sans typography
