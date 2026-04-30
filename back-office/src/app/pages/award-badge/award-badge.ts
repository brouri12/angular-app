import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-award-badge',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-2">Award Badge</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">Attribuer un badge a un etudiant (API: POST /api/badges)</p>

      @if (loading) {
        <div class="p-6 text-center text-gray-600 dark:text-gray-400">Loading...</div>
      } @else if (error) {
        <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-200">
          {{ error }}
        </div>
      } @else {
        <div class="max-w-xl border rounded p-4 bg-white dark:bg-gray-800">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-2">Etudiant</label>
              <select class="w-full p-2 border rounded" [(ngModel)]="studentId">
                <option [ngValue]="null">-- Choisir --</option>
                @for (s of students; track s.id) {
                  <option [ngValue]="s.id">{{ (s.firstName || '') + ' ' + (s.lastName || '') }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Cours (optionnel)</label>
              <select class="w-full p-2 border rounded" [(ngModel)]="courseId">
                <option [ngValue]="null">-- Aucun --</option>
                @for (c of courses; track c.id) {
                  <option [ngValue]="c.id">{{ c.title || c.courseCode || c.id }}</option>
                }
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium mb-2">Nom du badge</label>
              <input class="w-full p-2 border rounded" [(ngModel)]="badgeName" placeholder="Course completed" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Type</label>
              <select class="w-full p-2 border rounded" [(ngModel)]="badgeType">
                <option value="COURSE_COMPLETION">COURSE_COMPLETION</option>
                <option value="QUIZ_MASTER">QUIZ_MASTER</option>
                <option value="PERFECT_SCORE">PERFECT_SCORE</option>
                <option value="EXPERT">EXPERT</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Level</label>
              <select class="w-full p-2 border rounded" [(ngModel)]="badgeLevel">
                <option value="BRONZE">BRONZE</option>
                <option value="SILVER">SILVER</option>
                <option value="GOLD">GOLD</option>
              </select>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded bg-gradient-to-r from-[rgb(0,200,151)] to-[rgb(255,127,80)] text-white"
              (click)="submit()"
              [disabled]="busy">
              {{ busy ? 'Saving...' : 'Attribuer' }}
            </button>
          </div>

          @if (okMsg) {
            <div class="mt-3 p-3 rounded bg-green-50 text-green-800 border border-green-200">{{ okMsg }}</div>
          }
        </div>
      }
    </div>
  `,
})
export class AwardBadgePage {
  loading = true;
  error: string | null = null;
  busy = false;
  okMsg: string | null = null;

  students: any[] = [];
  courses: any[] = [];

  studentId: number | null = null;
  courseId: number | null = null;
  badgeName = '';
  badgeType = 'COURSE_COMPLETION';
  badgeLevel = 'GOLD';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    Promise.all([
      this.http.get<any[]>('/api/students').toPromise(),
      this.http.get<any[]>('/api/courses').toPromise(),
    ])
      .then(([students, courses]) => {
        this.students = students || [];
        this.courses = courses || [];
        this.loading = false;
      })
      .catch((e) => {
        this.error = e?.error?.message || e?.message || 'Erreur chargement data';
        this.loading = false;
      });
  }

  submit(): void {
    if (!this.studentId) {
      alert('Choisissez un etudiant.');
      return;
    }
    this.busy = true;
    this.okMsg = null;

    const name = (this.badgeName || '').trim() || 'Course completed';
    const body: any = {
      studentId: this.studentId,
      badgeName: name,
      badgeType: this.badgeType,
      description: name,
      courseId: this.courseId,
      badgeLevel: this.badgeLevel,
      earnedDate: new Date().toISOString().slice(0, 10),
    };

    this.http.post('/api/badges', body).subscribe({
      next: () => {
        this.busy = false;
        this.badgeName = '';
        this.okMsg = 'Badge attribue.';
      },
      error: (e) => {
        this.busy = false;
        alert(e?.error?.message || e?.message || 'Erreur');
      },
    });
  }
}

