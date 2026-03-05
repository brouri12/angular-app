import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AbonnementService, AbonnementAnalytics } from '../../services/abonnement.service';
import { AuthService } from '../../services/auth.service';
import { HistoriqueAbonnement } from '../../models/abonnement.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  private abonnementService = inject(AbonnementService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  @ViewChild('accessLevelChart') accessLevelChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('popularityChart') popularityChartRef!: ElementRef<HTMLCanvasElement>;
  
  loading = signal(true);
  analytics = signal<AbonnementAnalytics | null>(null);
  paiements = signal<HistoriqueAbonnement[]>([]);
  
  private charts: Chart[] = [];
  
  stats = signal([
    {
      label: 'Total Subscriptions',
      value: '0',
      change: '+0%',
      positive: true,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    {
      label: 'Active Plans',
      value: '0',
      change: '+0%',
      positive: true,
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      label: 'Average Price',
      value: '$0',
      change: '+0%',
      positive: true,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Revenue Potential',
      value: '$0',
      change: '+0%',
      positive: true,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  ]);

  ngOnInit() {
    // Check if token is in URL (from cross-origin redirect)
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        console.log('Token received from URL, saving...');
        // Save token to localStorage
        this.authService.saveToken(token);
        // Update authentication state
        this.authService['isAuthenticatedSubject'].next(true);
        // Remove token from URL and reload page
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        }).then(() => {
          // Reload page to reinitialize AuthService with token
          window.location.reload();
        });
        return; // Don't load data yet, wait for reload
      }
    });
    
    this.loadData();
  }

  ngAfterViewInit() {
    // Charts will be created after data is loaded
  }

  ngOnDestroy() {
    // Cleanup charts
    this.charts.forEach(chart => chart.destroy());
  }

  loadData() {
    this.loading.set(true);
    
    // Load analytics
    this.abonnementService.getAnalytics().subscribe({
      next: (data) => {
        console.log('✓ Analytics loaded:', data);
        this.analytics.set(data);
        this.updateStats();
        this.loading.set(false);
        
        // Create charts after data is loaded
        setTimeout(() => this.createCharts(), 100);
      },
      error: (err) => {
        console.error('✗ Error loading analytics:', err);
        this.loading.set(false);
      }
    });
  }

  updateStats() {
    const analytics = this.analytics();
    if (!analytics) return;
    
    this.stats.set([
      {
        label: 'Total Subscriptions',
        value: analytics.totalAbonnements.toString(),
        change: analytics.activeAbonnements > 0 
          ? `${((analytics.activeAbonnements / analytics.totalAbonnements) * 100).toFixed(1)}% active`
          : '0% active',
        positive: true,
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      },
      {
        label: 'Active Plans',
        value: analytics.activeAbonnements.toString(),
        change: analytics.inactiveAbonnements > 0 
          ? `${analytics.inactiveAbonnements} inactive`
          : 'All active',
        positive: analytics.inactiveAbonnements === 0,
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
      },
      {
        label: 'Average Price',
        value: `${analytics.averagePrice.toFixed(2)} TND`,
        change: analytics.withPrioritySupport > 0 
          ? `${analytics.withPrioritySupport} with priority`
          : 'No priority plans',
        positive: true,
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        label: 'Revenue Potential',
        value: `${analytics.totalRevenuePotential.toFixed(2)} TND`,
        change: analytics.withUnlimitedAccess > 0 
          ? `${analytics.withUnlimitedAccess} unlimited`
          : 'No unlimited plans',
        positive: true,
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      }
    ]);
  }

  getRecentPayments() {
    return this.paiements().slice(0, 4);
  }

  createCharts() {
    const analytics = this.analytics();
    if (!analytics) return;

    // Destroy existing charts
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    // Access Level Chart (Doughnut)
    if (this.accessLevelChartRef) {
      const accessLevelData = analytics.countByAccessLevel;
      const accessLevelChart = new Chart(this.accessLevelChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(accessLevelData),
          datasets: [{
            data: Object.values(accessLevelData),
            backgroundColor: [
              'rgb(0, 200, 151)',
              'rgb(255, 127, 80)',
              'rgb(100, 149, 237)',
              'rgb(255, 193, 7)'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
      this.charts.push(accessLevelChart);
    }

    // Status Chart (Pie)
    if (this.statusChartRef) {
      const statusChart = new Chart(this.statusChartRef.nativeElement, {
        type: 'pie',
        data: {
          labels: ['Active', 'Inactive'],
          datasets: [{
            data: [analytics.activeAbonnements, analytics.inactiveAbonnements],
            backgroundColor: [
              'rgb(0, 200, 151)',
              'rgb(239, 68, 68)'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = analytics.totalAbonnements;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
      this.charts.push(statusChart);
    }

    // Popularity Chart (Bar)
    if (this.popularityChartRef) {
      const popularityData = analytics.popularityByName;
      const popularityChart = new Chart(this.popularityChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(popularityData),
          datasets: [{
            label: 'Subscriptions',
            data: Object.values(popularityData),
            backgroundColor: 'rgba(0, 200, 151, 0.8)',
            borderColor: 'rgb(0, 200, 151)',
            borderWidth: 2,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `Count: ${context.parsed.y}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
      this.charts.push(popularityChart);
    }
  }
}
