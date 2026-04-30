import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-questions',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-2">Manage Questions</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">Gérer questions par cours</p>

      <div class="max-w-xl mb-4">
        <label class="block text-sm font-medium mb-2">Cours</label>
        <select class="w-full p-2 border rounded" [(ngModel)]="courseId" (ngModelChange)="loadQuestions()">
          <option [ngValue]="null">-- Choisir un cours --</option>
          @for (c of courses; track c.id) {
            <option [ngValue]="c.id">{{ c.title || c.courseCode || c.id }}</option>
          }
        </select>
      </div>

      @if (loading) {
        <div class="p-6 text-center text-gray-600 dark:text-gray-400">Loading questions...</div>
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
                <th class="text-left p-3">Question</th>
                <th class="text-left p-3">Type</th>
                <th class="text-left p-3">Points</th>
                <th class="text-left p-3">Correct</th>
                <th class="text-left p-3">Ordre</th>
              </tr>
            </thead>
            <tbody>
              @for (q of questions; track q.id) {
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3">{{ q.id }}</td>
                  <td class="p-3">{{ q.questionText }}</td>
                  <td class="p-3">{{ q.questionType }}</td>
                  <td class="p-3">{{ q.points ?? 0 }}</td>
                  <td class="p-3">{{ q.correctAnswer || '-' }}</td>
                  <td class="p-3">{{ q.orderNumber ?? '-' }}</td>
                </tr>
              } @empty {
                <tr><td class="p-3 text-gray-600 dark:text-gray-400" colspan="6">Aucune question.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class QuestionsPage {
  courses: any[] = [];
  courseId: number | null = null;

  loading = false;
  error: string | null = null;
  questions: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/courses').subscribe({
      next: (data) => {
        this.courses = data || [];
      },
      error: () => {
        // no-op, only affects dropdown
      },
    });
  }

  loadQuestions(): void {
    if (!this.courseId) {
      this.questions = [];
      return;
    }

    this.loading = true;
    this.error = null;

    // Comme dans teacher.html: includeInactive=1
    this.http
      .get<any[]>(`/api/questions?courseId=${this.courseId}&includeInactive=1`)
      .subscribe({
        next: (data) => {
          this.questions = data || [];
          this.loading = false;
        },
        error: (e) => {
          this.error = e?.error?.message || e?.message || 'Erreur chargement questions';
          this.loading = false;
        },
      });
  }
}

