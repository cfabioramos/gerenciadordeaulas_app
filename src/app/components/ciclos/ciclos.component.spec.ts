import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiclosComponent } from './ciclos.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('CiclosComponent', () => {
  let component: CiclosComponent;
  let fixture: ComponentFixture<CiclosComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [CiclosComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(CiclosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar sem ciclos', () => {
    expect(component.ciclos).toEqual([]);
  });

  it('applyFilter deve filtrar por termo', () => {
    component.ciclos = [{ id: 1, nome: 'Ciclo A' } as any, { id: 2, nome: 'Ciclo B' } as any];
    component.searchTerm = 'a';
    component.applyFilter();
    expect(component.filteredCiclos.length).toBe(1);
  });

  it('sortBy deve alternar direção na mesma coluna', () => {
    component.ciclos = [{ id: 1, nome: 'B', dataInicio: '2026-01-01' } as any, { id: 2, nome: 'A', dataInicio: '2026-02-01' } as any];
    component.applyFilter();
    component.sortBy('nome');
    expect(component.sortColumn).toBe('nome');
    component.sortBy('nome');
    expect(component.sortAscending).toBeFalse();
  });

  it('sortBy deve trocar coluna e resetar direção', () => {
    component.sortBy('dataInicio');
    expect(component.sortColumn).toBe('dataInicio');
  });

  it('isAdmin deve refletir localStorage', () => {
    localStorage.setItem('isAdmin', 'true');
    expect(component.isAdmin).toBeTrue();
  });
});
