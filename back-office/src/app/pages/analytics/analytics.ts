import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService, FeedbackStats } from '../../services/feedback.service';
import { ReclamationService, ReclamationAnalytics } from '../../services/reclamation.service';

interface ChartData {
  label: string;
  value: number;
  noteValue?: number;
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
  feedbackStats: FeedbackStats | null = null;
  reclamationAnalytics: ReclamationAnalytics | null = null;
  feedbackChartData: ChartData[] = [];
  reclamationChartData: ChartData[] = [];
  loading = true;
  error: string | null = null;

  topCourses = [
    { name: 'Web Development Bootcamp', enrollments: 1250, revenue: 62500, rating: 4.8 },
    { name: 'Data Science Fundamentals', enrollments: 980, revenue: 49000, rating: 4.7 },
    { name: 'UI/UX Design Masterclass', enrollments: 850, revenue: 42500, rating: 4.9 },
    { name: 'Mobile App Development', enrollments: 720, revenue: 36000, rating: 4.6 },
    { name: 'Digital Marketing Pro', enrollments: 650, revenue: 32500, rating: 4.5 }
  ];

  constructor(
    private feedbackService: FeedbackService,
    private reclamationService: ReclamationService
  ) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    this.error = null;

    this.feedbackService.getStats().subscribe({
      next: (stats) => {
        this.feedbackStats = stats;
        this.prepareFeedbackChartData(stats);
      },
      error: (err) => {
        console.error('Error loading feedback stats:', err);
        this.error = 'Erreur lors du chargement des statistiques de feedback';
      }
    });

    this.reclamationService.getAnalytics().subscribe({
      next: (analytics) => {
        this.reclamationAnalytics = analytics;
        this.prepareReclamationChartData(analytics);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reclamation analytics:', err);
        this.error = this.error ? this.error : 'Erreur lors du chargement des analytiques de réclamations';
        this.loading = false;
      }
    });
  }

  prepareFeedbackChartData(stats: FeedbackStats) {
    if (stats.repartitionNotes) {
      // Handle both string and number keys
      this.feedbackChartData = Object.entries(stats.repartitionNotes).map(([note, count]) => {
        const noteNum = typeof note === 'string' ? parseInt(note, 10) : note;
        return {
          label: `Note ${noteNum}`,
          value: Number(count),
          noteValue: noteNum
        };
      });
    }
  }

  prepareReclamationChartData(analytics: ReclamationAnalytics) {
    if (analytics.parStatus) {
      this.reclamationChartData = Object.entries(analytics.parStatus).map(([status, count]) => ({
        label: this.formatStatus(status),
        value: Number(count)
      }));
    }
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'en attente': 'En attente',
      'pending': 'En attente',
      'résolue': 'Résolue',
      'resolue': 'Résolue',
      'resolved': 'Résolue',
      'en cours': 'En cours',
      'in_progress': 'En cours',
      'rejetée': 'Rejetée',
      'rejetee': 'Rejetée',
      'rejected': 'Rejetée'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  getBarHeight(value: number, data: ChartData[]): string {
    if (!data || data.length === 0) return '0%';
    const max = Math.max(...data.map(d => d.value));
    if (max === 0) return '0%';
    return `${(value / max) * 100}%`;
  }

  getNoteColor(noteLabel: string): string {
    // Extract number from "Note X" format
    const match = noteLabel.match(/(\d+)/);
    if (!match) return '#6b7280';
    const note = parseInt(match[1], 10);
    if (note >= 4) return '#22c55e'; // green
    if (note >= 3) return '#eab308'; // yellow
    if (note >= 2) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  // Export methods for PDF/Excel
  exportFeedbacksPdf() {
    this.feedbackService.downloadFeedbacksPdf().subscribe({
      next: (blob) => this.downloadFile(blob, 'rapport_feedbacks.pdf'),
      error: (err) => {
        console.error('Error downloading PDF:', err);
        this.error = 'Erreur lors du téléchargement du PDF';
      }
    });
  }

  exportFeedbacksExcel() {
    this.feedbackService.downloadFeedbacksExcel().subscribe({
      next: (blob) => this.downloadFile(blob, 'rapport_feedbacks.xlsx'),
      error: (err) => {
        console.error('Error downloading Excel:', err);
        this.error = 'Erreur lors du téléchargement du fichier Excel';
      }
    });
  }

  exportReclamationsPdf() {
    this.reclamationService.downloadReclamationsPdf().subscribe({
      next: (blob) => this.downloadFile(blob, 'rapport_reclamations.pdf'),
      error: (err) => {
        console.error('Error downloading PDF:', err);
        this.error = 'Erreur lors du téléchargement du PDF';
      }
    });
  }

  exportReclamationsExcel() {
    this.reclamationService.downloadReclamationsExcel().subscribe({
      next: (blob) => this.downloadFile(blob, 'rapport_reclamations.xlsx'),
      error: (err) => {
        console.error('Error downloading Excel:', err);
        this.error = 'Erreur lors du téléchargement du fichier Excel';
      }
    });
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
