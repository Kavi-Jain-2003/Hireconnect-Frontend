import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { JobListComponent } from './job-list.component';
import { JobDetailComponent } from './job-detail.component';

const routes: Routes = [
  { path: '', component: JobListComponent },
  { path: ':id', component: JobDetailComponent }
];

@NgModule({
  declarations: [JobListComponent, JobDetailComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class JobsModule {}
