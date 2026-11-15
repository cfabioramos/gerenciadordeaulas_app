import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaAulasComponent } from './programa-aulas.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('ProgramaAulasComponent', () => {
  let component: ProgramaAulasComponent;
  let fixture: ComponentFixture<ProgramaAulasComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [ProgramaAulasComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramaAulasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar sem programas', () => {
    expect(component.programas).toEqual([]);
  });

  it('applyFilter deve filtrar por termo', () => {
    component.programas = [{ id: 1, nome: 'Prog A' } as any, { id: 2, nome: 'Prog B' } as any];
    component.searchTerm = 'a';
    component.applyFilter();
    expect(component.filteredProgramas.length).toBe(1);
  });

  it('toggleSort deve alternar direção', () => {
    component.programas = [{ id: 1, nome: 'B' } as any, { id: 2, nome: 'A' } as any];
    component.applyFilter();
    component.toggleSort();
    expect(component.sortAscending).toBeFalse();
  });

  it('isAdmin deve refletir localStorage', () => {
    localStorage.setItem('isAdmin', 'true');
    expect(component.isAdmin).toBeTrue();
  });
});
