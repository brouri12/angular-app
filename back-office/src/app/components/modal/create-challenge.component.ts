import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PronunciationAdminService } from '../../services/pronunciation-admin.service';
import { PronunciationChallenge } from '../../../models/pronunciation.types';

@Component({
  selector: 'app-create-challenge-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl">✨</span>
            <h2 class="text-2xl font-bold text-white">Créer un Nouveau Défi</h2>
          </div>
          <button (click)="onClose()" class="text-white text-4xl leading-none hover:text-gray-200 transition-colors">×</button>
        </div>

        <div class="p-8 space-y-8">
          <!-- Phrase -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Phrase <span class="text-red-500">*</span></label>
            <input [(ngModel)]="form.phrase" 
                   class="w-full bg-gray-800 border border-gray-600 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg"
                   placeholder="Ex: She sells seashells by the seashore...">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Niveau</label>
              <select [(ngModel)]="form.niveau" 
                      class="w-full bg-gray-800 border border-gray-600 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-500">
                <option value="A1">A1 - Débutant</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2 - Avancé</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select [(ngModel)]="form.type" 
                      class="w-full bg-gray-800 border border-gray-600 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-500">
                <option value="MOT">Mot</option>
                <option value="PHRASE">Phrase</option>
                <option value="DIALOGUE">Dialogue</option>
                <option value="PARAGRAPH">Paragraphe</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Difficulté</label>
              <select [(ngModel)]="form.difficulty" 
                      class="w-full bg-gray-800 border border-gray-600 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-500">
                <option value="EASY">Facile</option>
                <option value="MEDIUM">Moyen</option>
                <option value="HARD">Difficile</option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea [(ngModel)]="form.description" rows="4"
                      class="w-full bg-gray-800 border border-gray-600 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-500 resize-y"></textarea>
          </div>

          <!-- Phonetic -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Transcription Phonétique</label>
            <input [(ngModel)]="form.phoneticTranscription" 
                   class="w-full bg-gray-800 border border-gray-600 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-500 font-mono"
                   placeholder="/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔːr/">
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-6 border-t border-gray-700 flex justify-end gap-4 bg-gray-950">
          <button (click)="onClose()" 
                  class="px-8 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-2xl font-medium transition-colors">
            Annuler
          </button>
          <button (click)="createChallenge()" 
                  [disabled]="!isFormValid()"
                  class="px-10 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-2xl font-semibold transition-all">
            Créer le Défi
          </button>
        </div>
      </div>
    </div>
  `
})
export class CreateChallengeModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private service = inject(PronunciationAdminService);

  form: Partial<PronunciationChallenge> = {
    phrase: '',
    niveau: 'A1',
    type: 'PHRASE',
    difficulty: 'MEDIUM',
    description: '',
    phoneticTranscription: ''
  };

  isFormValid(): boolean {
    return !!this.form.phrase?.trim() && this.form.phrase.trim().length > 5;
  }

  createChallenge() {
    if (!this.isFormValid()) return;

    this.service.createChallenge(this.form as PronunciationChallenge).subscribe({
      next: () => {
        this.created.emit();
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de la création du défi");
      }
    });
  }

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  private resetForm() {
    this.form = {
      phrase: '',
      niveau: 'A1',
      type: 'PHRASE',
      difficulty: 'MEDIUM',
      description: '',
      phoneticTranscription: ''
    };
  }
}