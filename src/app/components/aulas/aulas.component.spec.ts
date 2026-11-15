import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulasComponent } from './aulas.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('AulasComponent', () => {
  let component: AulasComponent;
  let fixture: ComponentFixture<AulasComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [AulasComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(AulasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar sem aulas', () => {
    expect(component.aulas).toEqual([]);
  });

  it('formatData deve formatar data ISO', () => {
    expect(component.formatData('2026-01-05')).toContain('2026');
    expect(component.formatData(null)).toBe('');
  });

  it('applyFilter deve filtrar por termo', () => {
    component.aulas = [{ id: 1, nome: 'Aula A' } as any, { id: 2, nome: 'Aula B' } as any];
    component.searchTerm = 'b';
    component.applyFilter();
    expect(component.filteredAulas.length).toBe(1);
  });

  it('toggleSort deve alternar direção', () => {
    component.aulas = [{ id: 1, nome: 'B' } as any, { id: 2, nome: 'A' } as any];
    component.applyFilter();
    component.toggleSort();
    expect(component.sortAscending).toBeFalse();
  });

  it('isAdmin deve refletir localStorage', () => {
    localStorage.setItem('isAdmin', 'true');
    expect(component.isAdmin).toBeTrue();
  });
});
