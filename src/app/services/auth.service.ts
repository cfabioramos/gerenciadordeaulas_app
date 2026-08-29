import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from './gerenciador-aulas.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          localStorage.setItem('nome', response.nome || response.username);
          localStorage.setItem('isAdmin', String(response.admin));
          
          const theme = response.theme || 'nordeste';
          localStorage.setItem('theme', theme);
          this.applyTheme(theme);
          
          // Set session expiration to 10 minutes from now
          const expirationTime = new Date().getTime() + 10 * 60 * 1000;
          localStorage.setItem('token_expiration', expirationTime.toString());
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('nome');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token_expiration');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('token_expiration');
    
    if (!token || !expiration) {
      return false;
    }

    const now = new Date().getTime();
    if (now > parseInt(expiration, 10)) {
      this.logout();
      return false;
    }

    return true;
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getNome(): string {
    return localStorage.getItem('nome') || '';
  }

  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  applyTheme(theme: string) {
    const body = document.body;
    // Remove any theme class
    body.className = body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
    body.classList.add(`theme-${theme}`);
  }

  updateTheme(theme: string): Observable<any> {
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);

    if (this.isLoggedIn()) {
      return this.http.put<any>(`${API_URL}/auth/theme`, { theme });
    }

    return new Observable(observer => {
      observer.next({ success: true, theme });
      observer.complete();
    });
  }
}
