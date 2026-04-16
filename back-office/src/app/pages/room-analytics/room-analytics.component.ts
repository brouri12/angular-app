import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanificationService } from '../../services/planification.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-room-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-analytics.component.html',
  styleUrls: ['./room-analytics.component.css']
})
export class RoomAnalyticsComponent implements OnInit {
  analytics: any = null;
  loading = true;

  constructor(
    private planifService: PlanificationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void { this.loadAnalytics(); }

  loadAnalytics(): void {
    this.loading = true;
    this.planifService.getRoomAnalytics().subscribe({
      next: (data) => { this.analytics = data; this.loading = false; },
      error: () => { this.notificationService.error('Failed to load room analytics'); this.loading = false; }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'UNDERUTILIZED': return 'text-yellow-600 bg-yellow-100';
      case 'OPTIMAL':       return 'text-green-600 bg-green-100';
      case 'OVERUTILIZED':  return 'text-red-600 bg-red-100';
      default:              return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'UNDERUTILIZED': return '⚠️';
      case 'OPTIMAL':       return '✅';
      case 'OVERUTILIZED':  return '🔴';
      default:              return '❓';
    }
  }

  getUtilizationBarColor(pct: number): string {
    if (pct < 30) return 'bg-yellow-500';
    if (pct > 80) return 'bg-red-500';
    return 'bg-green-500';
  }

  getDayKeys(): string[] { return this.analytics?.schedulesByDay ? Object.keys(this.analytics.schedulesByDay) : []; }
  getTimeSlotKeys(): string[] { return this.analytics?.schedulesByTimeSlot ? Object.keys(this.analytics.schedulesByTimeSlot) : []; }
  getMaxScheduleCount(): number { return this.analytics?.schedulesByDay ? Math.max(...Object.values(this.analytics.schedulesByDay) as number[], 1) : 1; }
  getMaxTimeSlotCount(): number { return this.analytics?.schedulesByTimeSlot ? Math.max(...Object.values(this.analytics.schedulesByTimeSlot) as number[], 1) : 1; }
}
