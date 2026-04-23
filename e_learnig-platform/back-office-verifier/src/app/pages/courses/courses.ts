import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-courses',
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses implements OnInit {
  courses: Array<{ id: number; title: string; instructor: string; category: string; students: number; price: string; status: string; rating: number }> = [];
  loading = true;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getCourses().subscribe({
      next: (data: any[]) => {
        this.courses = (data || []).map((c: any) => ({
          id: c.id,
          title: c.title || '',
          instructor: c.teacherName || '',
          category: c.level || 'Course',
          students: c.maxStudents ?? 0,
          price: c.price != null ? `${c.price}€` : '',
          status: c.status || 'Published',
          rating: 4.5,
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de charger les cours. Démarre le backend (port 8081).';
        this.loading = false;
      }
    });
  }
}
