import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
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
  loadError = '';
  categories = ['IT', 'Finance', 'Marketing', 'HR', 'Sales', 'Operations', 'Design', 'Engineering'];
  types = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

  constructor(private jobService: JobService, public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.loadError = '';

    this.jobService.getAllJobs().pipe(
      timeout(15000),
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: jobs => {
        this.allJobs = jobs || [];
        this.applyFilters();
      },
      error: err => {
        this.allJobs = [];
        this.filteredJobs = [];
        this.loadError = err?.name === 'TimeoutError'
          ? 'Loading jobs took too long. Please try again.'
          : 'Failed to load jobs. Please try again.';
      }
    });
  }

  applyFilters() {
    const title = (this.searchTitle || '').trim().toLowerCase();
    const location = (this.searchLocation || '').trim().toLowerCase();
    const category = (this.selectedCategory || '').trim();
    const type = (this.selectedType || '').trim();

    this.filteredJobs = this.allJobs.filter(j =>
      (!title || j.title.toLowerCase().includes(title) || j.company.toLowerCase().includes(title)) &&
      (!location || j.location.toLowerCase().includes(location)) &&
      (!category || j.category === category) &&
      (!type || j.type === type)
    );
  }

  filter() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTitle = ''; this.searchLocation = '';
    this.selectedCategory = ''; this.selectedType = '';
    this.applyFilters();
  }

  formatSalary(min: number, max: number): string {
    const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(0)}L` : `₹${(n/1000).toFixed(0)}K`;
    return min && max ? `${fmt(min)} – ${fmt(max)}` : 'Negotiable';
  }

  logout() { this.auth.logout(); this.router.navigate(['/']); }
}
