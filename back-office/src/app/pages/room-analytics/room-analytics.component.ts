import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanificationService } from '../../services/planification.service';
import { NotificationService } from '../../services/notification.service';

interface RoomUtilization {
  roomId: number;
  roomName: string;
  location: string;
  capacity: number;
  totalSchedules: number;
  hoursPerWeek: number;
  utilizationPercentage: number;
  peakDay: string;
  peakTimeSlot: string;
  status: string;
}

interface RoomAnalyticsSummary {
  totalRooms: number;
  activeRooms: number;
  underutilizedRooms: number;
  averageUtilization: number;
  roomUtilizations: RoomUtilization[];
  schedulesByDay: { [key: string]: number };
  schedulesByTimeSlot: { [key: string]: number };
  recommendations: string[];
}

@Component({
  selector: 'app-room-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-analytics.component.html',
  styleUrls: ['./room-analytics.component.css']
})
export class RoomAnalyticsComponent implements OnInit {
  analytics: RoomAnalyticsSummary | null = null;
  loading = true;

  constructor(
    private planifService: PlanificationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.planifService.getRoomAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load analytics:', error);
        this.notificationService.error('Failed to load room analytics');
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'UNDERUTILIZED':
        return 'text-yellow-600 bg-yellow-100';
      case 'OPTIMAL':
        return 'text-green-600 bg-green-100';
      case 'OVERUTILIZED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'UNDERUTILIZED':
        return '⚠️';
      case 'OPTIMAL':
        return '✅';
      case 'OVERUTILIZED':
        return '🔴';
      default:
        return '❓';
    }
  }

  getUtilizationBarColor(percentage: number): string {
    if (percentage < 30) return 'bg-yellow-500';
    if (percentage > 80) return 'bg-red-500';
    return 'bg-green-500';
  }

  getDayKeys(): string[] {
    return this.analytics?.schedulesByDay ? Object.keys(this.analytics.schedulesByDay) : [];
  }

  getTimeSlotKeys(): string[] {
    return this.analytics?.schedulesByTimeSlot ? Object.keys(this.analytics.schedulesByTimeSlot) : [];
  }

  getMaxScheduleCount(): number {
    if (!this.analytics?.schedulesByDay) return 1;
    return Math.max(...Object.values(this.analytics.schedulesByDay), 1);
  }

  getMaxTimeSlotCount(): number {
    if (!this.analytics?.schedulesByTimeSlot) return 1;
    return Math.max(...Object.values(this.analytics.schedulesByTimeSlot), 1);
  }
}
