import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardsComponent } from './dashboards.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('DashboardsComponent', () => {
  let component: DashboardsComponent;
  let fixture: ComponentFixture<DashboardsComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [DashboardsComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getStatusClass deve classificar por faixa', () => {
    expect(component.getStatusClass(80)).toBe('status-high');
    expect(component.getStatusClass(60)).toBe('status-medium');
    expect(component.getStatusClass(30)).toBe('status-low');
  });

  it('getStatusLabel deve retornar rótulo por faixa', () => {
    expect(component.getStatusLabel(80)).toBe('Excelente');
    expect(component.getStatusLabel(60)).toBe('Regular');
    expect(component.getStatusLabel(30)).toBe('Atenção');
  });

  it('getStrokeOffset deve calcular offset', () => {
    expect(component.getStrokeOffset(0)).toBeCloseTo(226.19, 2);
    expect(component.getStrokeOffset(100)).toBeCloseTo(0, 2);
  });

  it('formatMoeda deve formatar valor', () => {
    expect(component.formatMoeda(12.5)).toContain('12');
    expect(component.formatMoeda(null)).toContain('0');
  });

  it('formatDateISO deve retornar ISO date', () => {
    const d = new Date(2026, 0, 5);
    expect(component.formatDateISO(d)).toBe('2026-01-05');
  });

  it('parseDate deve parsear formatos comuns', () => {
    expect(component.parseDate('2026-01-05')).toBeInstanceOf(Date);
    expect(component.parseDate(null)).toBeInstanceOf(Date);
  });

  it('formatDisplayDate deve formatar para pt-BR', () => {
    const r = component.formatDisplayDate('2026-01-05');
    expect(typeof r).toBe('string');
  });

  it('calcularMetricasFrequencia deve calcular totais', () => {
    component.dadosPresenca = [
      { nome: 'Ana', percentual: 80 } as any,
      { nome: 'Bia', percentual: 40 } as any,
    ];
    component.calcularMetricasFrequencia();
    expect(component.totalAlunos).toBe(2);
    expect(component.mediaFrequencia).toBe(60);
    expect(component.maiorFrequencia).toBe(80);
    expect(component.melhorAluno).toBe('Ana');
  });

  it('calcularMetricasFrequencia com lista vazia', () => {
    component.dadosPresenca = [];
    component.calcularMetricasFrequencia();
    expect(component.totalAlunos).toBe(0);
  });

  it('isAlunoSelected deve verificar seleção', () => {
    component.selectedAlunoIds = [1, 2];
    expect(component.isAlunoSelected(1)).toBeTrue();
    expect(component.isAlunoSelected(3)).toBeFalse();
  });

  it('toggleAlunoSelection deve alternar', () => {
    component.selectedAlunoIds = [];
    component.toggleAlunoSelection(5);
    expect(component.selectedAlunoIds).toContain(5);
    component.toggleAlunoSelection(5);
    expect(component.selectedAlunoIds).not.toContain(5);
  });

  it('selectAllAlunos e clearAlunoSelection', () => {
    component.alunos = [{ id: 1, nome: 'Ana' } as any, { id: 2, nome: 'Bia' } as any];
    component.selectAllAlunos();
    expect(component.selectedAlunoIds.length).toBe(2);
    component.clearAlunoSelection();
    expect(component.selectedAlunoIds.length).toBe(0);
  });

  it('getSelectedAlunosLabel deve rotular', () => {
    component.selectedAlunoIds = [];
    expect(component.getSelectedAlunosLabel()).toContain('Todos');
    component.selectedAlunoIds = [1];
    component.alunos = [{ id: 1, nome: 'Ana' } as any];
    expect(component.getSelectedAlunosLabel()).toContain('Ana');
  });

  it('dropdownAlunosList deve filtrar por termo', () => {
    component.alunos = [{ id: 1, nome: 'Ana' } as any, { id: 2, nome: 'Bia' } as any];
    component.alunoSearchTerm = 'an';
    expect(component.dropdownAlunosList.length).toBe(1);
  });

  it('initFinancialDates deve definir período', () => {
    component.initFinancialDates();
    expect(component.dataInicio).toBeTruthy();
    expect(component.dataFim).toBeTruthy();
  });

  it('setPreset deve ajustar datas', () => {
    component.setPreset('30d');
    expect(component.selectedPreset).toBe('30d');
    expect(component.dataInicio).toBeTruthy();
  });

  it('calcularMetricasFinanceiras deve calcular totais', () => {
    component.filteredPagamentos = [{ valor: 100 }, { valor: 50 }] as any;
    component.calcularMetricasFinanceiras();
    expect(component.totalPagamentosCount).toBe(2);
    expect(component.totalReceita).toBe(150);
    expect(component.ticketMedio).toBe(75);
    expect(component.maiorPagamento).toBe(100);
  });

  it('calcularMetricasFinanceiras com lista vazia', () => {
    component.filteredPagamentos = [];
    component.calcularMetricasFinanceiras();
    expect(component.totalPagamentosCount).toBe(0);
    expect(component.totalReceita).toBe(0);
  });

  it('applyFinancialFilters deve filtrar pagamentos', () => {
    component.pagamentos = [
      { id: 1, data: '2026-01-10', valor: 10, pagamentoMatriculas: [{ matricula: { aluno: { id: 1 }, programaAula: { ciclo: { id: 2 } } } }] },
    ] as any;
    component.dataInicio = '2026-01-01';
    component.dataFim = '2026-12-31';
    component.selectedAlunoIds = [];
    component.selectedCicloId = null;
    component.applyFinancialFilters();
    expect(component.filteredPagamentos.length).toBe(1);
  });

  it('limparFiltros deve resetar filtros', () => {
    component.alunoSearchTerm = 'x';
    component.selectedAlunoIds = [1];
    component.limparFiltros();
    expect(component.alunoSearchTerm).toBe('');
    expect(component.selectedAlunoIds.length).toBe(0);
  });

  it('gerarGraficoXY deve gerar pontos', () => {
    component.filteredPagamentos = [{ data: '2026-01-10', valor: 10 }] as any;
    component.gerarGraficoXY();
    expect(Array.isArray(component.chartPoints)).toBeTrue();
  });

  it('sortFinancialTable deve ordenar', () => {
    component.filteredPagamentos = [{ valor: 5 }, { valor: 10 }] as any;
    component.sortFinancialTable();
    expect(component.filteredPagamentos[0].valor).toBeLessThanOrEqual(component.filteredPagamentos[1].valor);
  });
});
