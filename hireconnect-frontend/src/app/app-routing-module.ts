import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'jobs', loadChildren: () => import('./features/jobs/jobs.module').then(m => m.JobsModule) },
  {
    path: 'candidate', canActivate: [AuthGuard], data: { roles: ['CANDIDATE'] },
    loadChildren: () => import('./features/candidate/candidate.module').then(m => m.CandidateModule)
  },
  {
    path: 'recruiter', canActivate: [AuthGuard], data: { roles: ['RECRUITER'] },
    loadChildren: () => import('./features/recruiter/recruiter.module').then(m => m.RecruiterModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
