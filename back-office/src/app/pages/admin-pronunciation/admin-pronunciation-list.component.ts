import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PronunciationAdminService } from '../../services/pronunciation-admin.service';
import type { PronunciationChallengeWithRecordings, Page, UserRecording } from '../../../models/pronunciation.types';
import { CreateChallengeModalComponent } from '../../components/modal/create-challenge.component';
import { PronunciationChallenge } from '../../../models/pronunciation.types';

@Component({
  selector: 'app-admin-pronunciation-list',
  standalone: true,
  imports: [CommonModule, CreateChallengeModalComponent],
  template: `
    <div class="min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300 p-6 lg:p-8 text-gray-500 dark:text-gray-400">
      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 class="text-4xl font-bold tracking-tight">Défis de Prononciation</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">Gestion administrative complète</p>
          </div>

          <button (click)="openCreateModal()"
                  class="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all active:scale-95">
            <span class="text-2xl">+</span>
            <span>Nouveau Défi</span>
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div class="bg-gray-900 border border-gray-800 rounded-3xl p-8">
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 bg-green-900/50 rounded-2xl flex items-center justify-center text-4xl">📚</div>
              <div>
                <p class="text-gray-400 text-sm">Total Défis</p>
                <p class="text-5xl font-bold">{{ totalChallenges() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-3xl p-8">
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 bg-blue-900/50 rounded-2xl flex items-center justify-center text-4xl">🎤</div>
              <div>
                <p class="text-gray-400 text-sm">Total Enregistrements</p>
                <p class="text-5xl font-bold">{{ totalRecordings() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-3xl p-8">
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 bg-orange-900/50 rounded-2xl flex items-center justify-center text-4xl">📊</div>
              <div>
                <p class="text-gray-400 text-sm">Score Moyen Global</p>
                <p class="text-5xl font-bold">{{ averageScore() | number:'1.0-1' }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="bg-gradient-to-r from-blue-600 to-indigo-600">
                <th class="px-8 py-6 text-left font-semibold">Phrase</th>
                <th class="px-8 py-6 text-left font-semibold">Niveau</th>
                <th class="px-8 py-6 text-left font-semibold">Type</th>
                <th class="px-8 py-6 text-center font-semibold">Enregistrements</th>
                <th class="px-8 py-6 text-center font-semibold">Score Moyen</th>
                <th class="px-8 py-6 text-center font-semibold w-40">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr *ngFor="let challenge of challenges(); trackBy: trackById"
                  class="hover:bg-gray-800 transition-colors">
                <td class="px-8 py-6 font-medium max-w-md truncate">{{ challenge.phrase }}</td>
                <td class="px-8 py-6">
                  <span [ngClass]="getNiveauClass(challenge.niveau)" 
                        class="inline-block px-5 py-1.5 text-xs font-semibold rounded-full">
                    {{ challenge.niveau }}
                  </span>
                </td>
                <td class="px-8 py-6">
                  <span class="px-5 py-1.5 text-xs font-medium bg-blue-900 text-blue-300 rounded-full">
                    {{ challenge.type }}
                  </span>
                </td>
                <td class="px-8 py-6 text-center">
                  <div class="font-semibold text-emerald-400">{{ challenge.recordingsCount || 0 }}</div>
                  <div class="text-xs text-gray-500">enregistrements</div>
                </td>
                <td class="px-8 py-6 text-center">
                  <div class="flex flex-col items-center gap-1">
                    <div class="w-28 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full bg-emerald-500 transition-all" 
                           [style.width.%]="challenge.averageScore || 0"></div>
                    </div>
                    <span class="text-sm font-medium">{{ challenge.averageScore | number:'1.1-1' }}%</span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex justify-center gap-6 text-xl">
                    <button (click)="editChallenge(challenge.id)" 
                            class="hover:text-blue-400 transition-colors">✏️</button>
                    <button (click)="deleteChallenge(challenge.id)" 
                            class="hover:text-red-400 transition-colors">🗑️</button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="challenges().length === 0 && !loading()">
                <td colspan="6" class="py-20 text-center text-gray-400">
                  <div class="text-6xl mb-4">📭</div>
                  <p>Aucun défi trouvé</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Create Modal -->
        <app-create-challenge-modal 
          [isOpen]="showCreateModal()" 
          (close)="showCreateModal.set(false)"
          (created)="onChallengeCreated()">
        </app-create-challenge-modal>
      </div>
    </div>
  `
})
export class PronunciationAdminListComponent implements OnInit {
  private service = inject(PronunciationAdminService);
  private router = inject(Router);

  challenges = signal<PronunciationChallengeWithRecordings[]>([]);
  loading = signal(false);
  page = signal(0);
  size = 10;

  totalChallenges = signal(0);
  totalRecordings = signal(0);
  averageScore = signal(0);

  showCreateModal = signal(false);

  ngOnInit() {
    this.loadChallenges();
    this.loadGlobalStats();
  }

  loadChallenges() {
    this.loading.set(true);
    this.service.getAllChallenges(this.page(), this.size).subscribe({
      next: (res: Page<PronunciationChallenge>) => {
        const challengesWithCount: PronunciationChallengeWithRecordings[] = (res.content || []).map(ch => ({
          ...ch,
          recordingsCount: 0
        }));

        this.challenges.set(challengesWithCount);

        // Load recordings count safely
        challengesWithCount.forEach(challenge => {
          this.service.getChallengeRecordings( challenge.id).subscribe({
            next: (recordings) => {
              challenge.recordingsCount = recordings ? recordings.length : 0;
              this.challenges.set([...this.challenges()]); // trigger signal update
            },
            error: () => {
              challenge.recordingsCount = 0;
              this.challenges.set([...this.challenges()]);
            }
          });
        });

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load challenges:', err);
        this.loading.set(false);
      }
    });
  }

  loadGlobalStats() {
    this.service.getGlobalStats().subscribe({
      next: (stats: any) => {
        console.log('Global stats response:', stats);
        this.totalChallenges.set(stats?.totalChallenges || 0);
        this.totalRecordings.set(stats?.totalRecordings || 0);
        this.averageScore.set(stats?.averageScore || 0);
      }
    });
   
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  onChallengeCreated() {
    this.loadChallenges();
    this.loadGlobalStats();
  }

  editChallenge(id: number) {
    this.router.navigate(['/admin/pronunciation/edit', id]);
  }

  deleteChallenge(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce défi ?\nCette action est irréversible.')) {
      this.service.deleteChallenge(id).subscribe({
        next: () => {
          this.loadChallenges();
          this.loadGlobalStats();
        }
      });
    }
  }

  trackById = (_: number, c: PronunciationChallengeWithRecordings) => c.id;

  getNiveauClass(niveau: string): string {
    const map: Record<string, string> = {
      'A1': 'bg-green-900 text-green-300',
      'A2': 'bg-emerald-900 text-emerald-300',
      'B1': 'bg-blue-900 text-blue-300',
      'B2': 'bg-indigo-900 text-indigo-300',
      'C1': 'bg-purple-900 text-purple-300',
      'C2': 'bg-violet-900 text-violet-300'
    };
    return map[niveau] || 'bg-gray-800 text-gray-300';
  }
}