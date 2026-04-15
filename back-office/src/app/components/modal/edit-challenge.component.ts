import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PronunciationAdminService } from '../../services/pronunciation-admin.service';
import type { PronunciationChallenge } from '../../../models/pronunciation.types';

@Component({
  selector: 'app-edit-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-950 text-white p-6 lg:p-8">
      <div class="max-w-2xl mx-auto">
        <button (click)="goBack()" 
                class="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          ← Retour à la liste
        </button>

        <h1 class="text-3xl font-bold mb-10">Modifier le Défi</h1>

        <div class="bg-gray-900 border border-gray-700 rounded-3xl p-10">
          <div class="space-y-8">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Phrase</label>
              <input [(ngModel)]="challenge.phrase" 
                     class="w-full bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Niveau</label>
                <select [(ngModel)]="challenge.niveau" 
                        class="w-full bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500">
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Type</label>
                <select [(ngModel)]="challenge.type" 
                        class="w-full bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500">
                  <option value="MOT">Mot</option>
                  <option value="PHRASE">Phrase</option>
                  <option value="DIALOGUE">Dialogue</option>
                  <option value="PARAGRAPH">Paragraphe</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Difficulté</label>
                <select [(ngModel)]="challenge.difficulty" 
                        class="w-full bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500">
                  <option value="EASY">Facile</option>
                  <option value="MEDIUM">Moyen</option>
                  <option value="HARD">Difficile</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea [(ngModel)]="challenge.description" rows="5"
                        class="w-full bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-2xl"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Transcription Phonétique</label>
              <input [(ngModel)]="challenge.phoneticTranscription" 
                     class="w-full bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-2xl font-mono">
            </div>
          </div>

          <div class="mt-12 flex gap-4">
            <button (click)="goBack()" 
                    class="flex-1 py-4 border border-gray-600 text-gray-300 rounded-2xl hover:bg-gray-800 font-medium">
              Annuler
            </button>
            <button (click)="save()" 
                    class="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold">
              Enregistrer les Modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EditChallengeComponent implements OnInit {
  private service = inject(PronunciationAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  challenge: PronunciationChallenge = {} as PronunciationChallenge;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.service.getChallengeById(id).subscribe({
        next: (data) => this.challenge = { ...data },
        error: () => this.router.navigate(['/admin/pronunciation'])
      });
    }
  }

  save() {
    this.service.updateChallenge(this.challenge.id, this.challenge).subscribe({
      next: () => {
        alert('Défi mis à jour avec succès !');
        this.router.navigate(['/admin/pronunciation']);
      },
      error: () => alert('Erreur lors de la sauvegarde')
    });
  }

  goBack() {
    this.router.navigate(['/admin/pronunciation']);
  }
}