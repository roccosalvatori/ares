import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'ares-theme';
  private isLightModeSubject = new BehaviorSubject<boolean>(false);
  public isLightMode$: Observable<boolean> = this.isLightModeSubject.asObservable();

  constructor() {
    // Load theme from localStorage on initialization
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme === 'light') {
      this.isLightModeSubject.next(true);
      this.applyTheme(true);
    } else {
      this.applyTheme(false);
    }
  }

  toggleTheme(): void {
    const currentMode = this.isLightModeSubject.value;
    const newMode = !currentMode;
    this.isLightModeSubject.next(newMode);
    this.applyTheme(newMode);
    localStorage.setItem(this.THEME_KEY, newMode ? 'light' : 'dark');
  }

  isLightMode(): boolean {
    return this.isLightModeSubject.value;
  }

  private applyTheme(isLight: boolean): void {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
    }
  }
}

