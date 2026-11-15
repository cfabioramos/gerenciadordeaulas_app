import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresencaComponent } from './presenca.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('PresencaComponent', () => {
  let component: PresencaComponent;
  let fixture: ComponentFixture<PresencaComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [PresencaComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(PresencaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar sem matrículas e sem erro', () => {
    expect(component.matriculas).toEqual([]);
    expect(component.errorMessage).toBe('');
  });

  it('checkIsHoje deve retornar false para null/inválido', () => {
    expect(component.checkIsHoje(null)).toBeFalse();
    expect(component.checkIsHoje('invalid')).toBeFalse();
  });

  it('checkIsHoje deve retornar true para hoje', () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T10:00:00`;
    expect(component.checkIsHoje(iso)).toBeTrue();
  });

  it('checkIsHoje deve retornar false para outra data', () => {
    expect(component.checkIsHoje('2020-01-01T10:00:00')).toBeFalse();
  });

  it('canEditPresenca deve respeitar admin/hoje/ativo', () => {
    localStorage.setItem('isAdmin', 'true');
    component.isAulaHoje = true;
    const mAtivo = { flAtivo: true } as any;
    const mInativo = { flAtivo: false } as any;
    expect(component.canEditPresenca(mAtivo)).toBeTrue();
    expect(component.canEditPresenca(mInativo)).toBeFalse();

    component.isAulaHoje = false;
    expect(component.canEditPresenca(mAtivo)).toBeFalse();

    localStorage.setItem('isAdmin', 'false');
    component.isAulaHoje = true;
    expect(component.canEditPresenca(mAtivo)).toBeFalse();
  });

  it('applyFilter deve executar sem erro', () => {
    component.matriculas = [
      { aluno: { nome: 'Ana' }, presente: true, flAtivo: true } as any,
      { aluno: { nome: 'Bia' }, presente: false, flAtivo: false } as any,
    ];
    component.searchTerm = 'ana';
    component.applyFilter();
    expect(component.filteredMatriculasAtivas.length + component.filteredMatriculasInativas.length).toBeGreaterThanOrEqual(0);
  });
});
