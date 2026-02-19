import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-courses',
  imports: [],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses implements OnInit {
  courses: Array<{ title: string; instructor: string; price: string; rating: number; image: string; category: string }> = [];
  loading = true;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getCourses().subscribe({
      next: (data: any[]) => {
        this.courses = (data || []).map((c: any) => ({
          title: c.title || '',
          instructor: c.teacherName || '',
          price: c.price != null ? `${c.price}€` : '',
          rating: 4.5,
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
          category: c.level || 'Course',
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
