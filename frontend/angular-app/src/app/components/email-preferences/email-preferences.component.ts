import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailPreferenceService, EmailPreferenceDTO } from '../../services/email-preference.service';

@Component({
  selector: 'app-email-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">Préférences de Notification Email</h2>
      
      <div *ngIf="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>

      <div *ngIf="!loading && preferences" class="space-y-4">
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">Emails de bienvenue</h3>
              <p class="text-sm text-gray-600">Recevoir un email lors de l'inscription</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="preferences.welcomeEmails" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">Notifications de réponse</h3>
              <p class="text-sm text-gray-600">Recevoir un email quand quelqu'un répond à vos messages</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="preferences.replyNotifications" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">Digest hebdomadaire</h3>
              <p class="text-sm text-gray-600">Résumé des activités du forum chaque dimanche</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="preferences.weeklyDigests" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">Alertes de mention</h3>
              <p class="text-sm text-gray-600">Recevoir un email quand quelqu'un vous mentionne avec @username</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="preferences.mentionAlerts" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">Résumé quotidien</h3>
              <p class="text-sm text-gray-600">Résumé des messages non lus chaque jour à 18h</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="preferences.dailySummaries" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">Rappels de discussions non lues</h3>
              <p class="text-sm text-gray-600">Rappel des discussions auxquelles vous participez</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="preferences.unreadReminders" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="border-t pt-4 mt-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-red-600">Se désabonner de tout</h3>
                <p class="text-sm text-gray-600">Désactiver toutes les notifications email</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="preferences.unsubscribeAll" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            (click)="savePreferences()"
            [disabled]="saving"
            class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {{ saving ? 'Enregistrement...' : 'Enregistrer les préférences' }}
          </button>
        </div>

        <div *ngIf="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {{ successMessage }}
        </div>

        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EmailPreferencesComponent implements OnInit {
  preferences: EmailPreferenceDTO | null = null;
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';
  userId = 1; // TODO: Get from auth service

  constructor(private emailPreferenceService: EmailPreferenceService) {}

  ngOnInit() {
    this.loadPreferences();
  }

  loadPreferences() {
    this.loading = true;
    this.emailPreferenceService.getPreferences(this.userId).subscribe({
      next: (prefs) => {
        this.preferences = prefs;
        this.loading = false;
      },
      error: () => {
        // Create default preferences if not found
        this.preferences = this.emailPreferenceService.getDefaultPreferences(this.userId);
        this.loading = false;
      }
    });
  }

  savePreferences() {
    if (!this.preferences) return;

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Essayer d'abord de mettre à jour, si ça échoue, créer
    this.emailPreferenceService.updatePreferences(this.userId, this.preferences).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Préférences enregistrées avec succès!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        // Si l'update échoue (404), essayer de créer
        if (error.status === 404) {
          this.emailPreferenceService.createPreferences(this.preferences!).subscribe({
            next: () => {
              this.saving = false;
              this.successMessage = 'Préférences créées avec succès!';
              setTimeout(() => this.successMessage = '', 3000);
            },
            error: () => {
              this.saving = false;
              this.errorMessage = 'Erreur lors de la création des préférences.';
              setTimeout(() => this.errorMessage = '', 3000);
            }
          });
        } else {
          this.saving = false;
          this.errorMessage = 'Erreur lors de l\'enregistrement des préférences.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      }
    });
  }
}
