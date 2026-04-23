import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbonnementService, AbonnementAnalytics } from '../../services/abonnement.service';
import { AuthService } from '../../services/auth.service';
import { ChallengeService, GlobalStatsDTO, UserRankDTO } from '../../services/challenge.service';
import { EventsService } from '../../services/events.service';
import { ClubService } from '../../services/club.service';
import { MemberAdminService } from '../../services/member-admin.service';
import { RegistrationAdminService } from '../../services/registration-admin.service';
import { HistoriqueAbonnement } from '../../models/abonnement.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  private abonnementService = inject(AbonnementService);
  private authService = inject(AuthService);
  private challengeService = inject(ChallengeService);
  private eventsService = inject(EventsService);
  private clubService = inject(ClubService);
  private memberService = inject(MemberAdminService);
  private registrationService = inject(RegistrationAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  @ViewChild('accessLevelChart') accessLevelChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('popularityChart') popularityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('levelChart') levelChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('typeChart') typeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventStatusChart') eventStatusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventTypeChart') eventTypeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventModeChart') eventModeChartRef!: ElementRef<HTMLCanvasElement>;
  
  loading = signal(true);
  analytics = signal<AbonnementAnalytics | null>(null);
  paiements = signal<HistoriqueAbonnement[]>([]);
  
  // Challenge stats signals
  challengeStats = signal<GlobalStatsDTO | null>(null);
  leaderboard = signal<UserRankDTO[]>([]);
  loadingChallengeStats = signal(true);

  // Mahdi services stats
  loadingMahdiStats = signal(true);
  totalEvents = signal(0);
  totalClubs = signal(0);
  totalMembers = signal(0);
  totalRegistrations = signal(0);
  eventsByStatus = signal<{ label: string; count: number }[]>([]);
  eventsByType = signal<{ label: string; count: number }[]>([]);
  eventsByMode = signal<{ label: string; count: number }[]>([]);
  
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

    // Load challenge global stats
    this.loadingChallengeStats.set(true);
    this.challengeService.getGlobalStats().subscribe({
      next: (data) => {
        console.log('✓ Challenge stats loaded:', data);
        this.challengeStats.set(data);
        this.loadingChallengeStats.set(false);
        setTimeout(() => this.createChallengeCharts(), 100);
      },
      error: (err) => {
        console.error('✗ Error loading challenge stats:', err);
        this.loadingChallengeStats.set(false);
      }
    });

    // Load leaderboard
    this.challengeService.getLeaderboard(10).subscribe({
      next: (data) => {
        console.log('✓ Leaderboard loaded:', data);
        this.leaderboard.set(data);
      },
      error: (err) => {
        console.error('✗ Error loading leaderboard:', err);
      }
    });

    // Load Mahdi services stats
    this.loadMahdiStats();
  }

  loadMahdiStats() {
    this.loadingMahdiStats.set(true);

    // Total counts via forkJoin — each call is independent, errors are swallowed
    forkJoin({
      events: this.eventsService.getAll().pipe(catchError(() => of([]))),
      clubs: this.clubService.getAll().pipe(catchError(() => of([]))),
      members: this.memberService.getAll().pipe(catchError(() => of([]))),
      registrations: this.registrationService.getAll().pipe(catchError(() => of([]))),
      byStatus: this.eventsService.statsByStatus().pipe(catchError(() => of([]))),
      byType: this.eventsService.statsByType().pipe(catchError(() => of([]))),
      byMode: this.eventsService.statsByMode().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.totalEvents.set((res.events as any[]).length);
        this.totalClubs.set((res.clubs as any[]).length);
        this.totalMembers.set((res.members as any[]).length);
        this.totalRegistrations.set((res.registrations as any[]).length);
        this.eventsByStatus.set((res.byStatus as any[]).map(r => ({ label: String(r[0]), count: Number(r[1]) })));
        this.eventsByType.set((res.byType as any[]).map(r => ({ label: String(r[0]), count: Number(r[1]) })));
        this.eventsByMode.set((res.byMode as any[]).map(r => ({ label: String(r[0]), count: Number(r[1]) })));
        this.loadingMahdiStats.set(false);
        setTimeout(() => this.createMahdiCharts(), 100);
      },
      error: () => this.loadingMahdiStats.set(false)
    });
  }

  createMahdiCharts() {
    const COLORS = [
      'rgba(0,200,151,0.85)', 'rgba(255,127,80,0.85)', 'rgba(100,149,237,0.85)',
      'rgba(255,193,7,0.85)', 'rgba(239,68,68,0.85)', 'rgba(168,85,247,0.85)'
    ];

    const makeChart = (ref: ElementRef<HTMLCanvasElement> | undefined, id: string, type: 'doughnut' | 'bar', labels: string[], data: number[]) => {
      if (!ref) return;
      const existing = this.charts.find(c => (c as any).__id === id);
      if (existing) existing.destroy();
      const chart = new Chart(ref.nativeElement, {
        type,
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: COLORS,
            borderColor: type === 'bar' ? COLORS : '#fff',
            borderWidth: type === 'bar' ? 0 : 2,
            borderRadius: type === 'bar' ? 8 : undefined,
          } as any]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } }
          },
          scales: type === 'bar' ? {
            y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          } : undefined
        }
      });
      (chart as any).__id = id;
      this.charts.push(chart);
    };

    const byStatus = this.eventsByStatus();
    const byType = this.eventsByType();
    const byMode = this.eventsByMode();

    if (byStatus.length) makeChart(this.eventStatusChartRef, 'evStatus', 'doughnut', byStatus.map(r => r.label), byStatus.map(r => r.count));
    if (byType.length) makeChart(this.eventTypeChartRef, 'evType', 'bar', byType.map(r => r.label), byType.map(r => r.count));
    if (byMode.length) makeChart(this.eventModeChartRef, 'evMode', 'doughnut', byMode.map(r => r.label), byMode.map(r => r.count));
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

  createCharts() {    const analytics = this.analytics();
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

  // ── Challenge chart helpers ────────────────────────────────────────────────

  createChallengeCharts() {
    const stats = this.challengeStats();
    if (!stats) return;

    // Submissions by Level (Bar)
    if (this.levelChartRef) {
      const existing = this.charts.find(c => (c as any).__id === 'level');
      if (existing) existing.destroy();

      const levelChart = new Chart(this.levelChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(stats.submissionsByLevel),
          datasets: [{
            label: 'Submissions',
            data: Object.values(stats.submissionsByLevel),
            backgroundColor: [
              'rgba(34,197,94,0.8)',
              'rgba(59,130,246,0.8)',
              'rgba(234,179,8,0.8)',
              'rgba(249,115,22,0.8)',
              'rgba(239,68,68,0.8)',
              'rgba(168,85,247,0.8)'
            ],
            borderRadius: 8,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
      (levelChart as any).__id = 'level';
      this.charts.push(levelChart);
    }

    // Submissions by Type (Doughnut)
    if (this.typeChartRef) {
      const existing = this.charts.find(c => (c as any).__id === 'type');
      if (existing) existing.destroy();

      const typeChart = new Chart(this.typeChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(stats.submissionsByType),
          datasets: [{
            data: Object.values(stats.submissionsByType),
            backgroundColor: [
              'rgb(0,200,151)',
              'rgb(255,127,80)',
              'rgb(100,149,237)',
              'rgb(255,193,7)',
              'rgb(239,68,68)',
              'rgb(168,85,247)',
              'rgb(20,184,166)',
              'rgb(251,146,60)'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } }
          }
        }
      });
      (typeChart as any).__id = 'type';
      this.charts.push(typeChart);
    }
  }

  getPassRateColor(rate: number): string {
    if (rate >= 70) return 'text-green-500';
    if (rate >= 40) return 'text-yellow-500';
    return 'text-red-500';
  }

  getPassRateBg(rate: number): string {
    if (rate >= 70) return 'bg-green-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getRankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  getRankRowClass(rank: number): string {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20 font-semibold';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-700/30 font-semibold';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-900/20 font-semibold';
    return '';
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      VOCABULARY: '📚', GRAMMAR: '✍️', READING: '📖',
      LISTENING: '👂', WRITING: '📝', SPEAKING: '🗣️',
      IDIOMS: '💬', MIXED: '🎯'
    };
    return icons[type] || '📋';
  }

  getLevelBadgeClass(level: string): string {
    const classes: { [key: string]: string } = {
      A1: 'bg-green-100 text-green-800',
      A2: 'bg-blue-100 text-blue-800',
      B1: 'bg-yellow-100 text-yellow-800',
      B2: 'bg-orange-100 text-orange-800',
      C1: 'bg-red-100 text-red-800',
      C2: 'bg-purple-100 text-purple-800'
    };
    return classes[level] || 'bg-gray-100 text-gray-800';
  }
}
