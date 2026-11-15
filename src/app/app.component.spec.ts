import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { provideAppTesting, resetBrowserState } from '../testing/test-providers';

describe('AppComponent', () => {
  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: provideAppTesting(),
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('deve expor o título padrão', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('gerenciadordeaulas_app');
  });

  it('deve gerar watermarks para todos os blocos', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.generateWatermarks('nordeste');
    expect(app.contentWatermarks.length).toBe(6);
    expect(app.sidebarWatermarks.length).toBe(2);
    expect(app.footerWatermarks.length).toBe(2);
    expect(app.watermarks.length).toBe(5);
  });

  it('deve mapear tema para label com fallback', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.getThemeLabel('forro')).toBe('Forró');
    expect(app.getThemeLabel('desconhecido')).toBe('desconhecido');
  });

  it('deve alternar tema e persistir', () => {
    localStorage.setItem('theme', 'nordeste');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.cycleTheme();
    expect(localStorage.getItem('theme')).not.toBe('nordeste');
  });

  it('deve retornar imagem do tema atual', () => {
    localStorage.setItem('theme', 'frevo');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.getThemeImage()).toContain('frevo_umbrella.jpg');
  });

  it('deve chamar applyTheme no construtor com tema salvo', () => {
    localStorage.setItem('theme', 'forro');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(document.body.classList.contains('theme-forro')).toBeTrue();
  });
});
