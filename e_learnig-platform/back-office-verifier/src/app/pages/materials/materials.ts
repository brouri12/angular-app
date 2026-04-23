import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-materials',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-2">PDF / Vidéo</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">Gestion ressources cours (API /api/courses/.../materials)</p>

      @if (loadingCourses) {
        <div class="p-6 text-center text-gray-600 dark:text-gray-400">Loading courses...</div>
      } @else if (coursesError) {
        <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-200">
          {{ coursesError }}
        </div>
      } @else {
        <div class="max-w-xl mb-6">
          <label class="block text-sm font-medium mb-2">Cours</label>
          <select class="w-full p-2 border rounded" [(ngModel)]="selectedCourseId" (ngModelChange)="loadMaterials()">
            <option [ngValue]="null">-- Choisir un cours --</option>
            @for (c of courses; track c.id) {
              <option [ngValue]="c.id">{{ c.title || c.courseCode || c.id }}</option>
            }
          </select>
        </div>
      }

      @if (selectedCourseId && loadingMaterials) {
        <div class="p-6 text-center text-gray-600 dark:text-gray-400">Loading materials...</div>
      } @else if (materialsError) {
        <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-200">
          {{ materialsError }}
        </div>
      } @else if (selectedCourseId) {
        <div class="max-w-4xl">
          <div class="mb-4">
            <h2 class="text-lg font-semibold mb-2">Liste des ressources</h2>
            <div class="overflow-auto border rounded">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th class="text-left p-3">Type</th>
                    <th class="text-left p-3">Titre</th>
                    <th class="text-left p-3">URL</th>
                    <th class="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of materials; track m.id) {
                    <tr class="border-t border-gray-200 dark:border-gray-700">
                      <td class="p-3">{{ m.type }}</td>
                      <td class="p-3">{{ m.title }}</td>
                      <td class="p-3">
                        <a class="text-[rgb(0,200,151)] hover:underline" [href]="m.url" target="_blank" rel="noopener">Ouvrir</a>
                      </td>
                      <td class="p-3">
                        <button class="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                          type="button"
                          (click)="deleteMaterial(m.id)">
                          Delete
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td class="p-3 text-gray-600 dark:text-gray-400" colspan="4">Aucune ressource.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="border rounded p-4">
            <h2 class="text-lg font-semibold mb-3">Uploader (PDF ou Vidéo)</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label class="block text-sm font-medium mb-2">Type</label>
                <select class="w-full p-2 border rounded" [(ngModel)]="newMaterialType">
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">VIDEO</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Titre</label>
                <input class="w-full p-2 border rounded" [(ngModel)]="newMaterialTitle" placeholder="Ex: Chapitre 1 - Introduction" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Fichier</label>
                <input type="file" accept=".pdf,video/*,application/pdf" (change)="onFileChange($event)" />
              </div>
            </div>

            @if (uploadError) {
              <div class="mb-3 p-3 rounded bg-red-50 text-red-700 border border-red-200">{{ uploadError }}</div>
            }
            <button class="px-4 py-2 rounded bg-gradient-to-r from-[rgb(0,200,151)] to-[rgb(255,127,80)] text-white"
              type="button"
              (click)="uploadMaterial()"
              [disabled]="!selectedFile || uploadBusy">
              {{ uploadBusy ? 'Uploading...' : 'Uploader' }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class MaterialsPage {
  courses: any[] = [];
  selectedCourseId: number | null = null;

  loadingCourses = true;
  coursesError: string | null = null;

  materials: any[] = [];
  loadingMaterials = false;
  materialsError: string | null = null;

  // Upload form
  newMaterialType: 'PDF' | 'VIDEO' = 'PDF';
  newMaterialTitle = '';
  selectedFile: File | null = null;
  uploadBusy = false;
  uploadError: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/courses').subscribe({
      next: (data) => {
        this.courses = (data || []).map((c) => ({ id: c.id, title: c.title, courseCode: c.courseCode }));
        this.loadingCourses = false;
      },
      error: (e) => {
        this.coursesError = e?.error?.message || e?.message || 'Erreur chargement courses';
        this.loadingCourses = false;
      },
    });
  }

  loadMaterials(): void {
    if (!this.selectedCourseId) {
      this.materials = [];
      return;
    }

    this.loadingMaterials = true;
    this.materialsError = null;

    this.http.get<any[]>(`/api/courses/${this.selectedCourseId}/materials`).subscribe({
      next: (data) => {
        this.materials = data || [];
        this.loadingMaterials = false;
      },
      error: (e) => {
        this.materialsError = e?.error?.message || e?.message || 'Erreur chargement materials';
        this.loadingMaterials = false;
      },
    });
  }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedFile = file;
    this.uploadError = null;
  }

  uploadMaterial(): void {
    if (!this.selectedCourseId || !this.selectedFile) return;
    this.uploadBusy = true;
    this.uploadError = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('type', this.newMaterialType);
    formData.append('title', this.newMaterialTitle || this.selectedFile.name);

    this.http
      .post(`/api/courses/${this.selectedCourseId}/materials/upload`, formData)
      .subscribe({
        next: () => {
          this.uploadBusy = false;
          this.newMaterialTitle = '';
          this.selectedFile = null;
          this.loadMaterials();
        },
        error: (e) => {
          this.uploadBusy = false;
          this.uploadError = e?.error?.message || e?.message || 'Erreur upload';
        },
      });
  }

  deleteMaterial(id: number): void {
    if (!confirm('Supprimer cette ressource ?')) return;
    this.http.delete(`/api/materials/${id}`).subscribe({
      next: () => this.loadMaterials(),
      error: (e) => {
        alert(e?.error?.message || e?.message || 'Erreur delete');
      },
    });
  }
}

