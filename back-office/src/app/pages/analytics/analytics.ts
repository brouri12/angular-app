import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService, FeedbackStats, SentimentStats } from '../../services/feedback.service';
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
  sentimentStats: SentimentStats | null = null;
  feedbackChartData: ChartData[] = [];
  reclamationChartData: ChartData[] = [];
  sentimentChartData: ChartData[] = [];
  loading = true;
  error: string | null = null;

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
        this.loading = false;
      }
    });

    this.reclamationService.getAnalytics().subscribe({
      next: (analytics) => {
        this.reclamationAnalytics = analytics;
        this.prepareReclamationChartData(analytics);
      },
      error: (err) => {
        console.error('Error loading reclamation analytics:', err);
        this.error = this.error ? this.error : 'Erreur lors du chargement des analytiques de réclamations';
        this.loading = false;
      }
    });

    // Load sentiment stats
    this.feedbackService.getSentimentStats().subscribe({
      next: (stats) => {
        this.sentimentStats = stats;
        this.prepareSentimentChartData(stats);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sentiment stats:', err);
        this.loading = false;
      }
    });
  }

  prepareSentimentChartData(stats: SentimentStats) {
    if (stats.repartitionParSentiment) {
      this.sentimentChartData = Object.entries(stats.repartitionParSentiment).map(([sentiment, count]) => ({
        label: this.formatSentiment(sentiment),
        value: Number(count)
      }));
    }
  }

  formatSentiment(sentiment: string): string {
    const sentimentMap: { [key: string]: string } = {
      'POSITIF': 'Positif',
      'NEGATIF': 'Négatif',
      'NEUTRE': 'Neutre'
    };
    return sentimentMap[sentiment] || sentiment;
  }

  getSentimentColor(sentimentLabel: string): string {
    if (sentimentLabel.toLowerCase().includes('positif')) return '#22c55e'; // green
    if (sentimentLabel.toLowerCase().includes('négatif') || sentimentLabel.toLowerCase().includes('negatif')) return '#ef4444'; // red
    return '#eab308'; // yellow
  }

  getObjectKeys(obj: { [key: string]: number }): string[] {
    return obj ? Object.keys(obj) : [];
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
