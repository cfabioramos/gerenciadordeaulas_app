import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  usernameOrEmail: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/ciclos']);
    }
  }

  ngOnInit(): void {
    const themes = ['nordeste', 'dancacircular', 'forro', 'frevo'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    this.changeTheme(randomTheme);
  }

  onSubmit() {
    if (!this.usernameOrEmail || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials = {
      usernameOrEmail: this.usernameOrEmail.trim(),
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/ciclos']);
      },
      error: (err) => {
        this.loading = false;
        if (err.error && err.error.error) {
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = 'Erro ao realizar login. Verifique suas credenciais.';
        }
        console.error(err);
      }
    });
  }

  get currentTheme(): string {
    return localStorage.getItem('theme') || 'nordeste';
  }

  changeTheme(theme: string): void {
    this.authService.updateTheme(theme).subscribe();
  }
}
