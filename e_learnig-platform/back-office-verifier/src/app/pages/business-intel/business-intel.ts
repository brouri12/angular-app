import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, timeout } from 'rxjs';

type LiveOverview = {
  generatedAt?: string;
  onlineStudentsApprox?: number;
  onlineWindowMinutes?: number;
  quizzesInProgress?: number;
  recentEnrollments?: Array<{
    id?: number;
    studentId?: number;
    courseId?: number;
    enrollmentDate?: string;
    courseTitle?: string;
    firstName?: string;
    lastName?: string;
  }>;
  latestCompletedQuizzes?: Array<{
    id?: number;
    studentId?: number;
    quizId?: number;
    scorePercent?: string;
    submittedAt?: string;
    completedAt?: string;
    quizTitle?: string;
    firstName?: string;
    lastName?: string;
  }>;
  latestBadges?: Array<{
    id?: number;
    studentId?: number;
    badgeName?: string;
    badgeLevel?: string;
    earnedDate?: string;
    firstName?: string;
    lastName?: string;
  }>;
  recentlyActiveStudents?: Array<{
    id?: number;
    firstName?: string;
    lastName?: string;
    lastLoginAt?: string;
    lastEvent?: string | null;
  }>;
};

type StudentAlerts = {
  generatedAt?: string;
  total?: number;
  alerts?: Array<{
    type?: string;
    severity?: 'danger' | 'warning' | 'info' | string;
    studentId?: number;
    courseId?: number;
    name?: string;
    message?: string;
  }>;
};

type Leaderboard = {
  generatedAt?: string;
  topByPoints?: Array<{ id?: number; firstName?: string; lastName?: string; country?: string | null; totalPoints?: string }>;
  topByAvgQuizScore?: Array<{ id?: number; firstName?: string; lastName?: string; avgScore?: string; attemptCount?: number }>;
  topByBadges?: Array<{ id?: number; firstName?: string; lastName?: string; country?: string | null; badgeCount?: number }>;
};

@Component({
  selector: 'app-business-intel',
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-3xl font-bold mb-1">Business Intel</h1>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Live overview + alerts + leaderboards (API: <span class="font-mono">/api/admin/*</span>)
          </p>
        </div>
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(0,200,151)] to-[rgb(255,127,80)] text-white hover:opacity-95"
          (click)="reload()"
          [disabled]="loading"
        >
          Actualiser
        </button>
      </div>

      @if (loading) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(0,200,151)]"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading business intel...</p>
        </div>
      } @else if (error) {
        <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-200">
          {{ error }}
        </div>
      } @else {
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">Online students (≈)</p>
            <p class="text-3xl font-bold mt-1">{{ onlineStudentsApprox }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Fenêtre {{ onlineWindowMinutes }} min</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">Quizzes in progress</p>
            <p class="text-3xl font-bold mt-1">{{ quizzesInProgress }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">Alertes</p>
            <p class="text-3xl font-bold mt-1">{{ alertsTotal }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">danger/warning</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">Dernière maj</p>
            <p class="text-sm font-semibold mt-2">{{ generatedAtText }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">UTC</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Alerts -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold mb-3">Alertes (top)</h2>
            @if (alerts.length === 0) {
              <p class="text-sm text-gray-600 dark:text-gray-400">Aucune alerte.</p>
            } @else {
              <div class="space-y-3">
                @for (a of alerts; track a.message) {
                  <div
                    class="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    [ngClass]="{
                      'bg-red-50 dark:bg-red-900/20': a.severity === 'danger',
                      'bg-amber-50 dark:bg-amber-900/20': a.severity === 'warning',
                      'bg-blue-50 dark:bg-blue-900/20': a.severity !== 'danger' && a.severity !== 'warning'
                    }"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div class="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                        {{ a.type || 'ALERT' }}
                      </div>
                      <div
                        class="text-xs font-semibold px-2 py-0.5 rounded-full"
                        [ngClass]="{
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': a.severity === 'danger',
                          'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200': a.severity === 'warning',
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': a.severity !== 'danger' && a.severity !== 'warning'
                        }"
                      >
                        {{ a.severity || 'info' }}
                      </div>
                    </div>
                    <div class="text-sm text-gray-800 dark:text-gray-100 mt-2">
                      {{ a.message }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      @if (a.studentId) { Student #{{ a.studentId }} }
                      @if (a.courseId) { · Course #{{ a.courseId }} }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Leaderboard -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold mb-3">Leaderboard (points)</h2>
            @if (topByPoints.length === 0) {
              <p class="text-sm text-gray-600 dark:text-gray-400">Aucune donnée.</p>
            } @else {
              <div class="overflow-auto">
                <table class="w-full text-sm">
                  <thead class="text-xs uppercase text-gray-500 dark:text-gray-400">
                    <tr>
                      <th class="text-left pb-2">Student</th>
                      <th class="text-right pb-2">Points</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    @for (r of topByPoints; track r.id) {
                      <tr>
                        <td class="py-2 pr-3">
                          <div class="font-semibold">#{{ r.id }} {{ fullName(r.firstName, r.lastName) }}</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">{{ r.country || '-' }}</div>
                        </td>
                        <td class="py-2 text-right font-bold">{{ r.totalPoints || '0' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Live overview -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold mb-3">Live overview</h2>

            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Inscriptions récentes</h3>
            @if (recentEnrollments.length === 0) {
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Aucune.</p>
            } @else {
              <div class="space-y-2 mb-4">
                @for (e of recentEnrollments; track e.id) {
                  <div class="p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-sm">
                    <span class="font-semibold">{{ e.courseTitle || ('Course #' + e.courseId) }}</span>
                    <span class="text-gray-600 dark:text-gray-400"> · {{ fullName(e.firstName, e.lastName) }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400"> · {{ e.enrollmentDate }}</span>
                  </div>
                }
              </div>
            }

            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Derniers quiz terminés</h3>
            @if (latestCompletedQuizzes.length === 0) {
              <p class="text-sm text-gray-600 dark:text-gray-400">Aucun.</p>
            } @else {
              <div class="space-y-2">
                @for (q of latestCompletedQuizzes; track q.id) {
                  <div class="p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-sm flex items-center justify-between gap-3">
                    <div>
                      <div class="font-semibold">{{ q.quizTitle || ('Quiz #' + q.quizId) }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">Student #{{ q.studentId }} · {{ q.completedAt || q.submittedAt }}</div>
                    </div>
                    <div class="font-bold text-[rgb(0,200,151)]">{{ scorePct(q.scorePercent) }}</div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Badges -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 lg:col-span-2">
            <h2 class="text-lg font-semibold mb-3">Derniers badges</h2>
            @if (latestBadges.length === 0) {
              <p class="text-sm text-gray-600 dark:text-gray-400">Aucun badge récent.</p>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (b of latestBadges; track b.id) {
                  <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <div class="flex items-center justify-between gap-3">
                      <div class="font-semibold">{{ b.badgeName || 'Badge' }}</div>
                      <div class="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        {{ b.badgeLevel || '-' }}
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Student #{{ b.studentId }} · {{ b.earnedDate }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class BusinessIntelPage {
  loading = true;
  error: string | null = null;
  // data sources
  live: LiveOverview | null = null;
  alertsRes: StudentAlerts | null = null;
  leaderboard: Leaderboard | null = null;

  // view model
  onlineStudentsApprox = 0;
  onlineWindowMinutes = 15;
  quizzesInProgress = 0;
  alertsTotal = 0;
  generatedAtText = '-';

  alerts: NonNullable<StudentAlerts['alerts']> = [];
  topByPoints: NonNullable<Leaderboard['topByPoints']> = [];
  recentEnrollments: NonNullable<LiveOverview['recentEnrollments']> = [];
  latestCompletedQuizzes: NonNullable<LiveOverview['latestCompletedQuizzes']> = [];
  latestBadges: NonNullable<LiveOverview['latestBadges']> = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.error = null;

    // On charge en chaîne pour rester simple (pas besoin de forkJoin)
    this.http
      .get<LiveOverview>('/api/admin/live-overview')
      .pipe(
        timeout(15000),
        catchError((e) => {
          this.error = e?.error?.message || e?.message || 'Erreur live-overview';
          return of(null);
        })
      )
      .subscribe((live) => {
        if (this.error) {
          this.loading = false;
          return;
        }
        this.live = live;

        this.http
          .get<StudentAlerts>('/api/admin/student-alerts')
          .pipe(
            timeout(15000),
            catchError((e) => {
              this.error = e?.error?.message || e?.message || 'Erreur student-alerts';
              return of(null);
            })
          )
          .subscribe((alerts) => {
            if (this.error) {
              this.loading = false;
              return;
            }
            this.alertsRes = alerts;

            this.http
              .get<Leaderboard>('/api/admin/student-leaderboard')
              .pipe(
                timeout(15000),
                catchError((e) => {
                  this.error = e?.error?.message || e?.message || 'Erreur leaderboard';
                  return of(null);
                }),
                finalize(() => {
                  this.loading = false;
                })
              )
              .subscribe((lb) => {
                this.leaderboard = lb;
                this.hydrate();
              });
          });
      });
  }

  private hydrate(): void {
    const live = this.live || {};
    const alertsRes = this.alertsRes || {};
    const lb = this.leaderboard || {};

    this.onlineStudentsApprox = Number(live.onlineStudentsApprox ?? 0) || 0;
    this.onlineWindowMinutes = Number(live.onlineWindowMinutes ?? 15) || 15;
    this.quizzesInProgress = Number(live.quizzesInProgress ?? 0) || 0;
    this.generatedAtText = String(live.generatedAt || alertsRes.generatedAt || lb.generatedAt || '-');

    this.alertsTotal = Number(alertsRes.total ?? (alertsRes.alerts?.length || 0)) || 0;
    this.alerts = (alertsRes.alerts || []).slice(0, 8);

    this.topByPoints = (lb.topByPoints || []).slice(0, 8);

    this.recentEnrollments = (live.recentEnrollments || []).slice(0, 6);
    this.latestCompletedQuizzes = (live.latestCompletedQuizzes || []).slice(0, 6);
    this.latestBadges = (live.latestBadges || []).slice(0, 8);
  }

  fullName(first?: string, last?: string): string {
    const a = String(first || '').trim();
    const b = String(last || '').trim();
    const s = `${a} ${b}`.trim();
    return s || '';
  }

  scorePct(v: unknown): string {
    const n = Number(v);
    return Number.isFinite(n) ? `${Math.round(n)}%` : '-';
  }
}

