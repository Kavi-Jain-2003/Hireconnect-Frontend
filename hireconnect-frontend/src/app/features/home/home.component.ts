import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../core/models';

@Component({
  standalone: false, selector: 'app-home', templateUrl: './home.component.html', styleUrls: ['./home.component.scss'] })
export class HomeComponent implements OnInit {
  featuredJobs: Job[] = [];
  stats = { jobs: 0, companies: 0, candidates: 0 };

  constructor(public auth: AuthService, private router: Router, private jobService: JobService) {}

  ngOnInit() {
    this.jobService.getAllJobs().subscribe({
      next: jobs => {
        this.featuredJobs = jobs.slice(0, 6);
        this.stats.jobs = jobs.length;
      },
      error: () => {}
    });
  }

  navigateTo(path: string) { this.router.navigate([path]); }
  logout() { this.auth.logout(); this.router.navigate(['/']); }
  getStatusClass(status: string): string { return 'badge-' + (status === 'OPEN' ? 'teal' : status === 'PAUSED' ? 'amber' : 'gray'); }
  formatSalary(min: number, max: number): string {
    const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(0)}L` : `₹${(n/1000).toFixed(0)}K`;
    return min && max ? `${fmt(min)} – ${fmt(max)}` : 'Salary not specified';
  }
}
