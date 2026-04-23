import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-responses',
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-2">Quiz Responses</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">Consultez les réponses des étudiants (API: /api/responses)</p>

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
                <th class="text-left p-3">Étudiant</th>
                <th class="text-left p-3">Course</th>
                <th class="text-left p-3">Question</th>
                <th class="text-left p-3">Réponse</th>
                <th class="text-left p-3">Correct</th>
                <th class="text-left p-3">Points</th>
                <th class="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              @for (r of rows; track r.id) {
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3">{{ (r.studentFirstName || '') + ' ' + (r.studentLastName || '') }}</td>
                  <td class="p-3">{{ r.courseTitle || r.courseCode || r.courseId || '-' }}</td>
                  <td class="p-3">{{ (r.questionText || '').slice(0, 60) }}@if ((r.questionText || '').length > 60) { … }</td>
                  <td class="p-3">{{ (r.answerText || '').slice(0, 60) }}@if ((r.answerText || '').length > 60) { … }</td>
                  <td class="p-3">@if (r.isCorrect === true) { ✓ } @else if (r.isCorrect === false) { ✗ } @else { - }</td>
                  <td class="p-3">{{ r.pointsEarned ?? '-' }}</td>
                  <td class="p-3">{{ r.submittedAt || '-' }}</td>
                </tr>
              } @empty {
                <tr><td class="p-3 text-gray-600 dark:text-gray-400" colspan="7">Aucune réponse.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class ResponsesPage {
  loading = true;
  error: string | null = null;
  rows: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/responses').subscribe({
      next: (data) => {
        this.rows = data || [];
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || e?.message || 'Erreur chargement responses';
        this.loading = false;
      },
    });
  }
}

