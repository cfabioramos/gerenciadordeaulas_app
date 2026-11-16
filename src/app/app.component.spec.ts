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
    expect(app.getThemeLabel('capoeira')).toBe('Capoeira');
    expect(app.getThemeLabel('desconhecido')).toBe('desconhecido');
  });

  it('deve gerar marcas-d\'água com imagens e animação da Capoeira', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.generateWatermarks('capoeira');
    const styles = JSON.stringify(app.contentWatermarks);
    expect(styles).toContain('/images/capoeira_');
    expect(app.sidebarWatermarks[0].style.animation).toContain('ginga');
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
    expect(app.getThemeImage('capoeira')).toContain('capoeira_berimbau.jpg');
  });

  it('deve incluir a Capoeira no ciclo de temas', () => {
    localStorage.setItem('theme', 'frevo');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.cycleTheme();
    expect(localStorage.getItem('theme')).toBe('capoeira');
  });

  it('deve chamar applyTheme no construtor com tema salvo', () => {
    localStorage.setItem('theme', 'forro');
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(document.body.classList.contains('theme-forro')).toBeTrue();
  });
});
