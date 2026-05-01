import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CandidateLayoutComponent } from './candidate-layout.component';
import { CandidateDashboardComponent } from './dashboard/candidate-dashboard.component';
import { CandidateApplicationsComponent } from './applications/candidate-applications.component';
import { CandidateProfileComponent } from './profile/candidate-profile.component';
import { CandidateInterviewsComponent } from './interviews/candidate-interviews.component';
import { CandidateNotificationsComponent } from './notifications/candidate-notifications.component';

const routes: Routes = [
  {
    path: '', component: CandidateLayoutComponent,
    children: [
      { path: 'dashboard', component: CandidateDashboardComponent },
      { path: 'applications', component: CandidateApplicationsComponent },
      { path: 'profile', component: CandidateProfileComponent },
      { path: 'interviews', component: CandidateInterviewsComponent },
      { path: 'notifications', component: CandidateNotificationsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [
    CandidateLayoutComponent, CandidateDashboardComponent,
    CandidateApplicationsComponent, CandidateProfileComponent,
    CandidateInterviewsComponent, CandidateNotificationsComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class CandidateModule {}
