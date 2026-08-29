import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private authService = inject(AuthService);
  title = 'gerenciadordeaulas_app';

  constructor() {
    const savedTheme = localStorage.getItem('theme') || 'nordeste';
    this.authService.applyTheme(savedTheme);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUsername(): string {
    return this.authService.getUsername();
  }

  getUserNome(): string {
    return this.authService.getNome();
  }

  logout(): void {
    this.authService.logout();
  }

  get currentTheme(): string {
    return localStorage.getItem('theme') || 'nordeste';
  }

  changeTheme(theme: string): void {
    this.authService.updateTheme(theme).subscribe();
  }

  onThemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.changeTheme(target.value);
    }
  }
}
