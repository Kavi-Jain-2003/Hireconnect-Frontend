import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { Job } from '../../core/models';

@Component({
  standalone: false, selector: 'app-job-list', templateUrl: './job-list.component.html', styleUrls: ['./job-list.component.scss'] })
export class JobListComponent implements OnInit {
  allJobs: Job[] = [];
  filteredJobs: Job[] = [];
  loading = true;
  searchTitle = '';
  searchLocation = '';
  selectedCategory = '';
  selectedType = '';
  categories = ['IT', 'Finance', 'Marketing', 'HR', 'Sales', 'Operations', 'Design', 'Engineering'];
  types = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

  constructor(private jobService: JobService, public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.jobService.getAllJobs().subscribe({
      next: jobs => { this.allJobs = jobs; this.filteredJobs = jobs; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filter() {
    this.filteredJobs = this.allJobs.filter(j =>
      (!this.searchTitle || j.title.toLowerCase().includes(this.searchTitle.toLowerCase()) || j.company.toLowerCase().includes(this.searchTitle.toLowerCase())) &&
      (!this.searchLocation || j.location.toLowerCase().includes(this.searchLocation.toLowerCase())) &&
      (!this.selectedCategory || j.category === this.selectedCategory) &&
      (!this.selectedType || j.type === this.selectedType)
    );
  }

  clearFilters() {
    this.searchTitle = ''; this.searchLocation = '';
    this.selectedCategory = ''; this.selectedType = '';
    this.filteredJobs = this.allJobs;
  }

  formatSalary(min: number, max: number): string {
    const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(0)}L` : `₹${(n/1000).toFixed(0)}K`;
    return min && max ? `${fmt(min)} – ${fmt(max)}` : 'Negotiable';
  }

  logout() { this.auth.logout(); this.router.navigate(['/']); }
}
