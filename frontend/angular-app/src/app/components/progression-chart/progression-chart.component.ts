import { Component, input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

import { UserRecording } from '../../shared/models/pronunciation.types';
import { computed } from '@angular/core';

interface ScoreData {
  date: string;
  score: number;
}

@Component({
  selector: 'app-progression-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-xs font-semibold tracking-[0.3em] text-indigo-400 uppercase">Progression</p>
          <h3 class="text-xl font-black mt-1">Score Over Time</h3>
        </div>
        <div class="text-right">
          <p class="text-2xl font-black text-emerald-400" *ngIf="avgScore()">{{ avgScore() | number:'1.1-1' }}%</p>
          <p class="text-xs text-slate-500">{{ recordings().length }} recordings</p>
        </div>
      </div>
      <canvas #chartCanvas class="w-full h-64"></canvas>
    </div>
  `,
})
export class ProgressionChartComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  recordings = input<UserRecording[]>([]);
  avgScore = computed(() => {
    const r = this.recordings();
    return r.length ? r.reduce((sum, r) => sum + (r.overallScore || 0), 0) / r.length : 0;
  });

  chart: Chart | null = null;

  ngOnInit() {
    this.createChart();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.getChartData();
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Pronunciation Score',
          data: data.scores,
          borderColor: 'rgb(99 102 241)', // indigo
          backgroundColor: 'rgba(99 102 241, 0.2)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: data.pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgb(99 102 241)',
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: 'white', stepSize: 20 }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.08)' },
            ticks: { color: 'white', maxTicksLimit: 6 }
          }
        }
      }
    });
  }

  private getChartData() {
    const recordings = this.recordings().filter(r => r.overallScore !== undefined && r.status === 'COMPLETED')
      .sort((a, b) => new Date(a.submittedAt!).getTime() - new Date(b.submittedAt!).getTime())
      .slice(-15); // Last 15

    const labels: string[] = [];
    const scores: number[] = [];
    const pointColors: string[] = [];

    recordings.forEach(r => {
      const date = new Date(r.submittedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(date);
      scores.push(r.overallScore!);
      
      // Color by score
      if (r.overallScore! >= 90) pointColors.push('#10B981'); // emerald
      else if (r.overallScore! >= 80) pointColors.push('#F59E0B'); // amber
      else pointColors.push('#EF4444'); // red
    });

    return { labels, scores, pointColors };
  }
}

