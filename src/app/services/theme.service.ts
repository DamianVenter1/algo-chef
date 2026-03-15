import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'algo-chef-theme';
  private readonly themeSubject: BehaviorSubject<Theme>;

  constructor() {
    const initialTheme = this.getInitialTheme();
    this.themeSubject = new BehaviorSubject<Theme>(initialTheme);
    this.applyTheme(initialTheme);
  }

  getTheme(): Observable<Theme> {
    return this.themeSubject.asObservable();
  }

  toggleTheme(): void {
    const nextTheme: Theme = this.themeSubject.value === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: Theme): void {
    if (this.themeSubject.value === theme) {
      return;
    }

    this.themeSubject.next(theme);
    this.persistTheme(theme);
    this.applyTheme(theme);
  }

  private getInitialTheme(): Theme {
    const storedTheme = this.getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }

    return this.getSystemThemePreference();
  }

  private getStoredTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch {
      return null;
    }
  }

  private getSystemThemePreference(): Theme {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  }

  private persistTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch {
      // Ignore storage errors (e.g., private mode).
    }
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
