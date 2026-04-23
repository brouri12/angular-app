import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, timeout } from 'rxjs';

type ReviewsOverview = {
  global?: {
    totalFeedbacks?: number;
    averageRating?: number;
    courseFeedbacks?: number;
    chapterFeedbacks?: number;
  };
  distribution?: Record<string, number>;
  topCourses?: Array<{ id?: number; title?: string; averageRating?: number; totalFeedbacks?: number }>;
  topChapters?: Array<{ id?: number; title?: string; averageRating?: number; totalFeedbacks?: number }>;
  recentFeedbacks?: Array<{
    id?: number;
    createdAt?: string;
    rating?: number;
    comment?: string;
    courseTitle?: string;
    chapterTitle?: string;
    studentName?: string;
  }>;
};

@Component({
  selector: 'app-reviews',
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-1">Reviews</h1>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Analytics reviews (API: <span class="font-mono">/api/admin/reviews/overview</span>)
        </p>
      </div>

      @if (loading) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(0,200,151)]"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading reviews analytics...</p>
        </div>
      } @else if (error) {
        <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-200">
          {{ error }}
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
                <p class="text-3xl font-bold mt-1">{{ totalFeedbacks }}</p>
              </div>
              <div class="p-3 rounded-lg bg-gradient-to-r from-[rgb(0,200,151)]/10 to-[rgb(255,127,80)]/10 text-[rgb(0,200,151)]">
                ★
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Moyenne globale</p>
                <p class="text-3xl font-bold mt-1">{{ avgRatingText }}</p>
              </div>
              <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                ✓
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">sur 5</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Reviews Course</p>
                <p class="text-3xl font-bold mt-1">{{ courseFeedbacks }}</p>
              </div>
              <div class="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300">
                📚
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Reviews Chapitres</p>
                <p class="text-3xl font-bold mt-1">{{ chapterFeedbacks }}</p>
              </div>
              <div class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                🧩
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Distribution -->
          <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold mb-4">Répartition des notes</h2>

            @for (row of distributionRows; track row.stars) {
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {{ row.stars }}★
                </div>
                <div class="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div
                    class="h-full bg-gradient-to-r from-[rgb(0,200,151)] to-[rgb(255,127,80)]"
                    [style.width.%]="row.pct"
                  ></div>
                </div>
                <div class="w-20 text-right text-sm text-gray-600 dark:text-gray-400">
                  {{ row.count }} ({{ row.pctText }})
                </div>
              </div>
            }
          </div>

          <!-- Recent -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold mb-4">Dernières reviews</h2>
            @if (recentFeedbacks.length === 0) {
              <p class="text-sm text-gray-600 dark:text-gray-400">Aucune review récente.</p>
            } @else {
              <div class="space-y-3">
                @for (f of recentFeedbacks; track f.id) {
                  <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <div class="flex items-center justify-between gap-3">
                      <div class="text-sm font-semibold">
                        {{ f.studentName || 'Student' }}
                      </div>
                      <div class="text-sm font-semibold text-amber-600 dark:text-amber-300">
                        {{ (f.rating ?? 0) }}/5
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      @if (f.courseTitle) { {{ f.courseTitle }} }
                      @if (f.chapterTitle) { · {{ f.chapterTitle }} }
                      @if (f.createdAt) { · {{ f.createdAt }} }
                    </div>
                    @if (f.comment) {
                      <div class="text-sm text-gray-700 dark:text-gray-200 mt-2">
                        {{ f.comment }}
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Top course -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 class="text-lg font-semibold mb-3">Top Courses</h2>
            @if (topCourses.length === 0) {
              <p class="text-sm text-gray-600 dark:text-gray-400">Aucune review course.</p>
            } @else {
              <div class="overflow-auto">
                <table class="w-full text-sm">
                  <thead class="text-xs uppercase text-gray-500 dark:text-gray-400">
                    <tr>
                      <th class="text-left pb-2">Course</th>
                      <th class="text-right pb-2">Moy.</th>
                      <th class="text-right pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    @for (c of topCourses; track c.id) {
                      <tr>
                        <td class="py-2 pr-3">{{ c.title || ('Course #' + c.id) }}</td>
                        <td class="py-2 text-right font-semibold">{{ formatRating(c.averageRating) }}</td>
                        <td class="py-2 text-right text-gray-600 dark:text-gray-400">{{ c.totalFeedbacks ?? 0 }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Top chapters -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 lg:col-span-2">
            <h2 class="text-lg font-semibold mb-3">Top chapitres (Parcours)</h2>
            @if (topChapters.length === 0) {
              <p class="text-sm text-gray-600 dark:text-gray-400">Aucune review chapitre.</p>
            } @else {
              <div class="overflow-auto">
                <table class="w-full text-sm">
                  <thead class="text-xs uppercase text-gray-500 dark:text-gray-400">
                    <tr>
                      <th class="text-left pb-2">Chapitre</th>
                      <th class="text-right pb-2">Moy.</th>
                      <th class="text-right pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    @for (c of topChapters; track c.id) {
                      <tr>
                        <td class="py-2 pr-3">{{ c.title || ('Chapitre #' + c.id) }}</td>
                        <td class="py-2 text-right font-semibold">{{ formatRating(c.averageRating) }}</td>
                        <td class="py-2 text-right text-gray-600 dark:text-gray-400">{{ c.totalFeedbacks ?? 0 }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ReviewsPage {
  loading = true;
  error: string | null = null;
  data: ReviewsOverview | null = null;

  totalFeedbacks = 0;
  courseFeedbacks = 0;
  chapterFeedbacks = 0;
  avgRatingText = '0.00';

  distributionRows: Array<{ stars: number; count: number; pct: number; pctText: string }> = [];
  topCourses: NonNullable<ReviewsOverview['topCourses']> = [];
  topChapters: NonNullable<ReviewsOverview['topChapters']> = [];
  recentFeedbacks: NonNullable<ReviewsOverview['recentFeedbacks']> = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Important: ne jamais rester bloqué sur "Loading..."
    this.http
      .get('/api/admin/reviews/overview')
      .pipe(
        timeout(15000),
        catchError((e) => {
          this.error =
            e?.error?.message ||
            e?.message ||
            'Erreur lors du chargement reviews (timeout / réseau / serveur).';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((d) => {
        this.data = (d as ReviewsOverview) || null;
        this.hydrateView(this.data);
      });
  }

  private hydrateView(d: ReviewsOverview | null): void {
    const g = d?.global || {};
    const dist = d?.distribution || {};

    this.totalFeedbacks = Number(g.totalFeedbacks ?? 0) || 0;
    this.courseFeedbacks = Number(g.courseFeedbacks ?? 0) || 0;
    this.chapterFeedbacks = Number(g.chapterFeedbacks ?? 0) || 0;
    const avg = Number(g.averageRating ?? 0);
    this.avgRatingText = Number.isFinite(avg) ? avg.toFixed(2) : '0.00';

    const total = this.totalFeedbacks || Object.values(dist).reduce((s, v) => s + (Number(v) || 0), 0) || 0;
    const rows = [5, 4, 3, 2, 1].map((stars) => {
      const count = Number(dist[String(stars)] ?? 0) || 0;
      const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
      return { stars, count, pct, pctText: `${pct}%` };
    });
    this.distributionRows = rows;

    this.topCourses = (d?.topCourses || []).slice(0, 8);
    this.topChapters = (d?.topChapters || []).slice(0, 10);
    this.recentFeedbacks = (d?.recentFeedbacks || []).slice(0, 6);
  }

  formatRating(v: unknown): string {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  }
}

