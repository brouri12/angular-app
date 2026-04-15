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

  toggleLanguage() {
    const newLang = this.currentLang === 'fr' ? 'en' : 'fr';
    this.setLanguage(newLang);
  }
}
