import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = 'fr';

  constructor(private translate: TranslateService) {
    // Langues disponibles
    this.translate.addLangs(['fr', 'en']);
    
    // Langue par défaut
    this.translate.setDefaultLang('fr');
    
    // Charger la langue depuis le localStorage ou utiliser le français
    const savedLang = localStorage.getItem('app-language') || 'fr';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('app-language', lang);
  }

  getCurrentLanguage(): string {
    return this.currentLang;
  }

  getAvailableLanguages(): readonly string[] {
    return this.translate.getLangs();
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'fr' ? 'en' : 'fr';
    this.setLanguage(newLang);
  }
}
