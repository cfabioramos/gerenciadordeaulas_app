import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlunosComponent } from './alunos.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('AlunosComponent', () => {
  let component: AlunosComponent;
  let fixture: ComponentFixture<AlunosComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [AlunosComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(AlunosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar sem alunos', () => {
    expect(component.alunos).toEqual([]);
  });

  it('applyFilter deve filtrar por termo', () => {
    component.alunos = [{ id: 1, nome: 'Ana' } as any, { id: 2, nome: 'Bia' } as any];
    component.searchTerm = 'an';
    component.applyFilter();
    expect(component.filteredAlunos.length).toBe(1);
  });

  it('toggleSort deve alternar direção e ordenar', () => {
    component.alunos = [{ id: 1, nome: 'Bia' } as any, { id: 2, nome: 'Ana' } as any];
    component.applyFilter();
    const before = component.filteredAlunos.map((a: any) => a.nome);
    component.toggleSort();
    const after = component.filteredAlunos.map((a: any) => a.nome);
    expect(before).not.toEqual(after);
  });

  it('isAdmin deve refletir localStorage', () => {
    localStorage.setItem('isAdmin', 'true');
    expect(component.isAdmin).toBeTrue();
  });
});
