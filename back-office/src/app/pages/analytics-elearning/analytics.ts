import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics {
  enrollmentData: ChartData[] = [
    { label: 'Jan', value: 120 },
    { label: 'Feb', value: 180 },
    { label: 'Mar', value: 250 },
    { label: 'Apr', value: 320 },
    { label: 'May', value: 280 },
    { label: 'Jun', value: 400 }
  ];

  revenueData: ChartData[] = [
    { label: 'Jan', value: 12000 },
    { label: 'Feb', value: 18000 },
    { label: 'Mar', value: 25000 },
    { label: 'Apr', value: 32000 },
    { label: 'May', value: 28000 },
    { label: 'Jun', value: 40000 }
  ];

  topCourses = [
    { name: 'Web Development Bootcamp', enrollments: 1250, revenue: 62500, rating: 4.8 },
    { name: 'Data Science Fundamentals', enrollments: 980, revenue: 49000, rating: 4.7 },
    { name: 'UI/UX Design Masterclass', enrollments: 850, revenue: 42500, rating: 4.9 },
    { name: 'Mobile App Development', enrollments: 720, revenue: 36000, rating: 4.6 },
    { name: 'Digital Marketing Pro', enrollments: 650, revenue: 32500, rating: 4.5 }
  ];

  getBarHeight(value: number, data: ChartData[]): string {
    const max = Math.max(...data.map(d => d.value));
    return `${(value / max) * 100}%`;
  }
}
