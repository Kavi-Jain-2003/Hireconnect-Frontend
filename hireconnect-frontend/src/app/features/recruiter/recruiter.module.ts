import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RecruiterLayoutComponent } from './recruiter-layout.component';
import { RecruiterDashboardComponent } from './dashboard/recruiter-dashboard.component';
import { RecruiterJobsComponent } from './jobs/recruiter-jobs.component';
import { RecruiterApplicationsComponent } from './applications/recruiter-applications.component';
import { RecruiterProfileComponent } from './profile/recruiter-profile.component';
import { RecruiterAnalyticsComponent } from './analytics/recruiter-analytics.component';
import { RecruiterSubscriptionComponent } from './subscription/recruiter-subscription.component';
import { RecruiterNotificationsComponent } from './notifications/recruiter-notifications.component';

const routes: Routes = [
  {
    path: '', component: RecruiterLayoutComponent,
    children: [
      { path: 'dashboard', component: RecruiterDashboardComponent },
      { path: 'jobs', component: RecruiterJobsComponent },
      { path: 'applications', component: RecruiterApplicationsComponent },
      { path: 'profile', component: RecruiterProfileComponent },
      { path: 'analytics', component: RecruiterAnalyticsComponent },
      { path: 'subscription', component: RecruiterSubscriptionComponent },
      { path: 'notifications', component: RecruiterNotificationsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    RecruiterLayoutComponent, RecruiterDashboardComponent, RecruiterJobsComponent,
    RecruiterApplicationsComponent, RecruiterProfileComponent,
    RecruiterAnalyticsComponent, RecruiterSubscriptionComponent,
    RecruiterNotificationsComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class RecruiterModule {}
