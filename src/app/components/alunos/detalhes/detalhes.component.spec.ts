import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesComponent } from './detalhes.component';
import { provideAppTesting, resetBrowserState } from '../../../../testing/test-providers';

describe('DetalhesComponent', () => {
  let component: DetalhesComponent;
  let fixture: ComponentFixture<DetalhesComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [DetalhesComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('salvar com nome vazio deve setar erro', () => {
    component.alunoNome = '   ';
    component.salvar();
    expect(component.errorMessage).toContain('não pode ser vazio');
  });

  it('resetForm deve restaurar nome original', () => {
    component.originalNome = 'Original';
    component.alunoNome = 'Alterado';
    component.resetForm();
    expect(component.alunoNome).toBe('Original');
    expect(component.errorMessage).toBe('');
  });

  it('isAdmin deve refletir localStorage', () => {
    localStorage.setItem('isAdmin', 'true');
    expect(component.isAdmin).toBeTrue();
  });
});
