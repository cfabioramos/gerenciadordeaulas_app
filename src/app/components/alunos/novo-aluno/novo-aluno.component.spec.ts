import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoAlunoComponent } from './novo-aluno.component';
import { provideAppTesting, resetBrowserState } from '../../../../testing/test-providers';

describe('NovoAlunoComponent', () => {
  let component: NovoAlunoComponent;
  let fixture: ComponentFixture<NovoAlunoComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [NovoAlunoComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(NovoAlunoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve exigir nome ao salvar', () => {
    component.salvar();
    expect(component.errorMessage).toContain('informe o nome');
  });

  it('salvar com nome deve limpar erro', () => {
    component.nome = 'Ana';
    // service call pending (HttpTesting) — apenas valida que não seta erro de validação
    component.salvar();
    expect(component.errorMessage).toBe('');
  });
});
