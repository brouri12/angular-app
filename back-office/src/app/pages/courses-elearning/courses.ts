import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormationService, Course } from '../../services/formation.service';

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

  constructor(private formation: FormationService) {}

  ngOnInit(): void {
    this.formation.getAllCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = (data || []).map((c: Course) => ({
          id: c.id ?? 0,
          title: c.title || '',
          instructor: [c.description?.trim(), c.duration != null ? `Durée ${c.duration} min` : '']
            .filter(Boolean)
            .join(' · ')
            .slice(0, 160),
          category: `Formation #${c.formationId}`,
          students: 0,
          price: '',
          status: 'Published',
          rating: 4.5,
        }));
        this.loading = false;
      },
      error: (err: unknown) => {
        const msg = err instanceof Error ? err.message : typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : '';
        this.error = msg || 'Impossible de charger les cours. Vérifiez l’API (gateway).';
        this.loading = false;
      }
    });
  }
}
