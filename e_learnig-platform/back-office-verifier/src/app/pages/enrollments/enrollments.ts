import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-enrollments',
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-2">Enrollments</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">Liste des inscriptions (API: /api/enrollments)</p>

      @if (loading) {
        <div class="p-6 text-center text-gray-600 dark:text-gray-400">Loading...</div>
      } @else if (error) {
        <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-200">
          {{ error }}
        </div>
      } @else {
        <div class="overflow-auto border rounded">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="text-left p-3">ID</th>
                <th class="text-left p-3">Étudiant</th>
                <th class="text-left p-3">Cours</th>
                <th class="text-left p-3">Statut</th>
                <th class="text-left p-3">Progression</th>
                <th class="text-left p-3">Note</th>
                <th class="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              @for (e of rows; track e.id) {
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3">{{ e.id }}</td>
                  <td class="p-3">{{ (e.studentFirstName || '') + ' ' + (e.studentLastName || '') }}</td>
                  <td class="p-3">{{ e.courseTitle || e.courseCode || e.courseId || '-' }}</td>
                  <td class="p-3">{{ e.status || '-' }}</td>
                  <td class="p-3">{{ e.completionPercentage != null ? (e.completionPercentage + '%') : '-' }}</td>
                  <td class="p-3">{{ e.finalGrade ?? '-' }}</td>
                  <td class="p-3">{{ e.enrollmentDate || '-' }}</td>
                </tr>
              } @empty {
                <tr><td class="p-3 text-gray-600 dark:text-gray-400" colspan="7">Aucune inscription.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class EnrollmentsPage {
  loading = true;
  error: string | null = null;
  rows: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/enrollments').subscribe({
      next: (data) => {
        this.rows = data || [];
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || e?.message || 'Erreur chargement enrollments';
        this.loading = false;
      },
    });
  }
}

