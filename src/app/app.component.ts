import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private themeSub: Subscription | null = null;
  
  title = 'gerenciadordeaulas_app';
  
  // Section-specific watermark collections
  contentWatermarks: any[] = []; // Tela Principal (Main Screen)
  sidebarWatermarks: any[] = []; // Menu (Sidebar)
  footerWatermarks: any[] = [];  // Footer / Rodapé
  watermarks: any[] = [];        // Global / Login container

  // Theme asset library: 3 distinct high-fidelity regional images per theme
  private themeAssets: { [key: string]: string[] } = {
    'nordeste': ['nordeste_cactus.jpg', 'nordeste_sun.jpg', 'nordeste_hat.jpg'],
    'dancacircular': ['circular_mandala.jpg', 'circular_figures.jpg', 'circular_stars.jpg'],
    'forro': ['forro_accordion.jpg', 'forro_triangle.jpg', 'forro_zabumba.jpg'],
    'frevo': ['frevo_umbrella.jpg', 'frevo_ribbons.jpg', 'frevo_dancer.jpg']
  };

  constructor() {
    const savedTheme = localStorage.getItem('theme') || 'nordeste';
    this.authService.applyTheme(savedTheme);
  }

  ngOnInit(): void {
    // Listen to reactive theme updates
    this.themeSub = this.authService.themeChange$.subscribe({
      next: (theme) => {
        this.generateWatermarks(theme);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }

  // Generates randomized watermarks distributed across Main Screen, Menu, Footer, and Background
  generateWatermarks(theme: string) {
    const assets = this.themeAssets[theme] || this.themeAssets['nordeste'];
    const animations = ['pulse-slow', 'spin-slow', 'swing', 'float-slow'];
    const isDark = theme === 'dancacircular';

    // 1. Tela Principal (Content Area - 6 randomized scattered watermarks)
    const contentItems = [];
    for (let i = 0; i < 6; i++) {
      const img = assets[Math.floor(Math.random() * assets.length)];
      const top = Math.floor(Math.random() * 80) + 5;  // 5% to 85%
      const left = Math.floor(Math.random() * 85) + 5; // 5% to 90%
      const size = Math.floor(Math.random() * 130) + 90; // 90px to 220px
      const rotate = Math.floor(Math.random() * 60) - 30; // -30deg to 30deg
      const baseOpacity = isDark ? 0.06 : 0.12;
      const opacity = (Math.random() * 0.08 + baseOpacity).toFixed(3);
      const animation = animations[Math.floor(Math.random() * animations.length)];
      const duration = Math.floor(Math.random() * 10) + 12;

      contentItems.push({
        style: {
          'position': 'absolute',
          'top': `${top}%`,
          'left': `${left}%`,
          'width': `${size}px`,
          'height': `${size}px`,
          'opacity': opacity,
          'transform': `rotate(${rotate}deg)`,
          'background-image': `url('/images/${img}')`,
          'background-size': 'contain',
          'background-repeat': 'no-repeat',
          'background-position': 'center',
          'pointer-events': 'none',
          'z-index': '0',
          'animation': `${animation} ${duration}s ease-in-out infinite alternate`
        }
      });
    }
    this.contentWatermarks = contentItems;

    // 2. Menu / Sidebar (2 subtle watermarks positioned nicely along the sidebar)
    const sidebarItems = [];
    const sidePositions = [
      { top: '15%', right: '-20px', size: 120, rotate: -15 },
      { bottom: '25px', right: '-15px', size: 140, rotate: 15 }
    ];
    for (let i = 0; i < sidePositions.length; i++) {
      const img = assets[i % assets.length];
      const pos = sidePositions[i];
      const baseOpacity = isDark ? 0.08 : 0.15;
      const animation = animations[i % animations.length];
      const duration = 14 + i * 4;

      const styleObj: any = {
        'position': 'absolute',
        'width': `${pos.size}px`,
        'height': `${pos.size}px`,
        'opacity': baseOpacity.toString(),
        'transform': `rotate(${pos.rotate}deg)`,
        'background-image': `url('/images/${img}')`,
        'background-size': 'contain',
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'pointer-events': 'none',
        'z-index': '1',
        'animation': `${animation} ${duration}s ease-in-out infinite alternate`
      };
      if (pos.top) styleObj['top'] = pos.top;
      if (pos.bottom) styleObj['bottom'] = pos.bottom;
      if (pos.right) styleObj['right'] = pos.right;

      sidebarItems.push({ style: styleObj });
    }
    this.sidebarWatermarks = sidebarItems;

    // 3. Footer / Rodapé (2 subtle watermarks placed across the footer bar)
    const footerItems = [];
    const footerPositions = [
      { left: '18%', size: 65, rotate: -10 },
      { right: '18%', size: 75, rotate: 12 }
    ];
    for (let i = 0; i < footerPositions.length; i++) {
      const img = assets[(i + 1) % assets.length];
      const pos = footerPositions[i];
      const baseOpacity = isDark ? 0.09 : 0.16;
      const animation = animations[(i + 2) % animations.length];
      const duration = 12 + i * 3;

      const styleObj: any = {
        'position': 'absolute',
        'top': '50%',
        'width': `${pos.size}px`,
        'height': `${pos.size}px`,
        'opacity': baseOpacity.toString(),
        'transform': `translateY(-50%) rotate(${pos.rotate}deg)`,
        'background-image': `url('/images/${img}')`,
        'background-size': 'contain',
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'pointer-events': 'none',
        'z-index': '1',
        'animation': `${animation} ${duration}s ease-in-out infinite alternate`
      };
      if (pos.left) styleObj['left'] = pos.left;
      if (pos.right) styleObj['right'] = pos.right;

      footerItems.push({ style: styleObj });
    }
    this.footerWatermarks = footerItems;

    // 4. Global / Login container watermarks (5 scattered items)
    const globalItems = [];
    for (let i = 0; i < 5; i++) {
      const img = assets[Math.floor(Math.random() * assets.length)];
      const top = Math.floor(Math.random() * 80) + 5;
      const left = Math.floor(Math.random() * 85) + 5;
      const size = Math.floor(Math.random() * 120) + 80;
      const rotate = Math.floor(Math.random() * 60) - 30;
      const baseOpacity = isDark ? 0.05 : 0.10;
      const opacity = (Math.random() * 0.06 + baseOpacity).toFixed(3);
      const animation = animations[Math.floor(Math.random() * animations.length)];
      const duration = Math.floor(Math.random() * 8) + 14;

      globalItems.push({
        style: {
          'position': 'absolute',
          'top': `${top}%`,
          'left': `${left}%`,
          'width': `${size}px`,
          'height': `${size}px`,
          'opacity': opacity,
          'transform': `rotate(${rotate}deg)`,
          'background-image': `url('/images/${img}')`,
          'background-size': 'contain',
          'background-repeat': 'no-repeat',
          'background-position': 'center',
          'pointer-events': 'none',
          'z-index': '0',
          'animation': `${animation} ${duration}s ease-in-out infinite alternate`
        }
      });
    }
    this.watermarks = globalItems;
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
