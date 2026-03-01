import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

interface ReviewsOverview {
  global: {
    totalFeedbacks: number;
    averageRating: number;
    courseFeedbacks: number;
    chapterFeedbacks: number;
  };
  distribution: Record<string, number>;
  topCourses: Array<{
    id: number;
    title: string;
    level: string;
    status: string;
    feedbackCount: number;
    averageRating: number;
  }>;
  topChapters: Array<{
    id: number;
    title: string;
    levelCode: string;
    levelName: string;
    feedbackCount: number;
    averageRating: number;
  }>;
  recentFeedbacks: Array<{
    sourceType: 'COURSE' | 'CHAPTER';
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    targetId: number;
    targetTitle: string;
    author: string;
  }>;
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
  loading = true;
  error: string | null = null;

  data: ReviewsOverview = {
    global: {
      totalFeedbacks: 0,
      averageRating: 0,
      courseFeedbacks: 0,
      chapterFeedbacks: 0,
    },
    distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    topCourses: [],
    topChapters: [],
    recentFeedbacks: [],
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.loading = true;
    this.error = null;
    this.api.getAdminReviewsOverview(8, 10).subscribe({
      next: (raw: unknown) => {
        const payload = (raw || {}) as Partial<ReviewsOverview>;
        this.data = {
          global: {
            totalFeedbacks: Number(payload.global?.totalFeedbacks || 0),
            averageRating: Number(payload.global?.averageRating || 0),
            courseFeedbacks: Number(payload.global?.courseFeedbacks || 0),
            chapterFeedbacks: Number(payload.global?.chapterFeedbacks || 0),
          },
          distribution: {
            '1': Number(payload.distribution?.['1'] || 0),
            '2': Number(payload.distribution?.['2'] || 0),
            '3': Number(payload.distribution?.['3'] || 0),
            '4': Number(payload.distribution?.['4'] || 0),
            '5': Number(payload.distribution?.['5'] || 0),
          },
          topCourses: (payload.topCourses || []).map((c) => ({
            ...c,
            feedbackCount: Number(c.feedbackCount || 0),
            averageRating: Number(c.averageRating || 0),
          })),
          topChapters: (payload.topChapters || []).map((c) => ({
            ...c,
            feedbackCount: Number(c.feedbackCount || 0),
            averageRating: Number(c.averageRating || 0),
          })),
          recentFeedbacks: (payload.recentFeedbacks || []).map((r) => ({
            ...r,
            rating: Number(r.rating || 0),
          })),
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de charger les statistiques review.';
        this.loading = false;
      },
    });
  }

  distributionRows(): Array<{ stars: number; count: number; pct: number }> {
    const total = this.data.global.totalFeedbacks || 0;
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = Number(this.data.distribution[String(stars)] || 0);
      return {
        stars,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
  }

  renderStars(value: number): string {
    const rounded = Math.round(Number(value || 0));
    return Array.from({ length: 5 }, (_, i) => (i < rounded ? '★' : '☆')).join('');
  }

  formatDate(value: string): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  }
}
