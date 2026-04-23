import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.theme.set(savedTheme);
    } else {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)');
      if (prefersDark?.matches) {
        this.theme.set('dark');
      }
    }

    effect(() => {
      const theme = this.theme();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    });
  }

  toggleTheme() {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }
}
