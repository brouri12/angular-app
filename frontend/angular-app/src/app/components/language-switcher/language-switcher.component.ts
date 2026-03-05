import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggleLanguage()"
      class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
      title="Change language / Changer la langue"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
      </svg>
      <span class="text-sm">{{ currentLang === 'fr' ? 'FR' : 'EN' }}</span>
    </button>
  `,
  styles: []
})
export class LanguageSwitcherComponent {
  private translationService = inject(TranslationService);
  
  get currentLang(): string {
    return this.translationService.getCurrentLanguage();
  }

  toggleLanguage() {
    this.translationService.toggleLanguage();
  }
}
