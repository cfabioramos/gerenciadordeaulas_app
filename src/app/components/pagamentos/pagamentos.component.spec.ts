import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentosComponent } from './pagamentos.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('PagamentosComponent', () => {
  let component: PagamentosComponent;
  let fixture: ComponentFixture<PagamentosComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [PagamentosComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(PagamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar sem pagamentos e sem erro', () => {
    expect(component.pagamentos).toEqual([]);
    expect(component.errorMessage).toBe('');
  });

  it('getTodayDateString deve retornar formato dd/MM/yyyy', () => {
    const r = component.getTodayDateString();
    expect(r).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('formatProgramas deve formatar lista', () => {
    expect(component.formatProgramas([])).toBe('-');
    expect(component.formatProgramas([{ programaAulaNome: 'P', valorMensalidadeDia: 10 }])).toContain('P');
  });

  it('getDiscountPercentage deve calcular desconto', () => {
    const p = { itens: [{ valorMensalidadeDia: 100 }], valor: 80 };
    expect(component.getDiscountPercentage(p)).toBe('20%');
    expect(component.getDiscountPercentage({ itens: [] })).toBe('0%');
    expect(component.getDiscountPercentage({ itens: [{ valorMensalidadeDia: 0 }], valor: 0 })).toBe('0%');
  });

  it('recalculateTotalValue deve somar selecionados', () => {
    component.isEditing = false;
    component.activeMatriculas = [{ id: 1, valorMensalidade: 50 }, { id: 2, valorMensalidade: 30 }] as any;
    component.selectedMatriculaIds = { 1: true, 2: false };
    component.recalculateTotalValue();
    expect(component.valor).toBe(50);
  });

  it('recalculateTotalValue não deve alterar em edição', () => {
    component.isEditing = true;
    component.valor = 999;
    component.recalculateTotalValue();
    expect(component.valor).toBe(999);
  });

  it('discountInfo deve calcular em modo novo', () => {
    component.isEditing = false;
    component.activeMatriculas = [{ id: 1, valorMensalidade: 100 }] as any;
    component.selectedMatriculaIds = { 1: true };
    component.valor = 80;
    expect(component.discountInfo).toContain('%');
  });

  it('isAdmin deve refletir localStorage', () => {
    localStorage.setItem('isAdmin', 'true');
    expect(component.isAdmin).toBeTrue();
  });
});
