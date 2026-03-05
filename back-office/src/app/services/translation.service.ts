import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = 'fr';

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');
    
    const savedLang = localStorage.getItem('backoffice-language') || 'fr';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('backoffice-language', lang);
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
