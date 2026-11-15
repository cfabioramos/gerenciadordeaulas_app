import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatriculasComponent } from './matriculas.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('MatriculasComponent', () => {
  let component: MatriculasComponent;
  let fixture: ComponentFixture<MatriculasComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [MatriculasComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(MatriculasComponent);
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

  it('formatMatriculaId deve formatar com zeros', () => {
    expect(component.formatMatriculaId(42)).toBe('00042');
    expect(component.formatMatriculaId(null)).toBe('-');
    expect(component.formatMatriculaId(undefined)).toBe('-');
  });

  it('isAdmin deve refletir localStorage', () => {
    localStorage.setItem('isAdmin', 'true');
    expect(component.isAdmin).toBeTrue();
  });

  it('sortBy deve alternar direção', () => {
    component.matriculas = [{ id: 1 }, { id: 2 }] as any;
    component.sortBy('id');
    expect(component.sortColumn).toBe('id');
    expect(component.sortAscending).toBeFalse();
  });
});
