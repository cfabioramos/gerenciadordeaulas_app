import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';

export interface AlunoFrequencia {
  nome: string;
  percentual: number;
}

export interface ChartPoint {
  dateStr: string;
  formattedDate: string;
  valor: number;
  count: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboards.component.html',
  styleUrl: './dashboards.component.css'
})
export class DashboardsComponent implements OnInit {
  // Tabs: 'frequencia' (left) | 'financeiro' (right)
  activeTab: 'frequencia' | 'financeiro' = 'frequencia';

  // ==========================================
  // 1. DADOS & ESTADO DA ABA FREQUÊNCIA
  // ==========================================
  dadosPresenca: AlunoFrequencia[] = [
    { nome: "Ciro Jobart", percentual: 99 },
    { nome: "Carlos Fábio", percentual: 95 },
    { nome: "Jao", percentual: 80 },
    { nome: "Letícia", percentual: 70 },
    { nome: "Josefa", percentual: 40 },
    { nome: "Guilhermina", percentual: 30 }
  ];

  totalAlunos: number = 0;
  mediaFrequencia: number = 0;
  maiorFrequencia: number = 0;
  menorFrequencia: number = 0;
  melhorAluno: string = '';
  selectedView: 'bars' | 'columns' | 'ranking' = 'bars';

  // ==========================================
  // 2. DADOS & ESTADO DA ABA FINANCEIRO
  // ==========================================
  dataInicio: string = '';
  dataFim: string = '';
  selectedCicloId: number | null = null;
  selectedAlunoIds: number[] = [];
  selectedPreset: string = '30d';

  // Multi-select Alunos
  alunoDropdownOpen: boolean = false;
  alunoSearchTerm: string = '';

  ciclos: any[] = [];
  alunos: any[] = [];
  pagamentos: any[] = [];
  filteredPagamentos: any[] = [];
  loadingFinanceiro: boolean = false;

  // KPI Metrics Financeiras
  totalReceita: number = 0;
  totalPagamentosCount: number = 0;
  ticketMedio: number = 0;
  maiorPagamento: number = 0;

  // Gráfico X x Y (Linha do Tempo x Receita)
  chartPoints: ChartPoint[] = [];
  svgPathLine: string = '';
  svgPathArea: string = '';
  yAxisMarkers: { label: string; y: number }[] = [];
  maxYValue: number = 100;
  hoveredPoint: ChartPoint | null = null;
  chartViewType: 'area' | 'bar' = 'area';

  // Tabela Financeira
  tableSearch: string = '';
  sortColumn: string = 'data';
  sortAscending: boolean = false;

  constructor(
    private service: GerenciadorAulasService,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.alunoDropdownOpen && !this.elementRef.nativeElement.querySelector('.aluno-multi-filter')?.contains(event.target)) {
      this.alunoDropdownOpen = false;
    }
  }

  ngOnInit(): void {
    this.calcularMetricasFrequencia();
    this.initFinancialDates();
    this.loadFilterOptions();
    this.loadFinancialData();
  }

  // ------------------------------------------
  // LÓGICA DE FREQUÊNCIA
  // ------------------------------------------
  calcularMetricasFrequencia(): void {
    this.totalAlunos = this.dadosPresenca.length;
    if (this.totalAlunos > 0) {
      const soma = this.dadosPresenca.reduce((acc, item) => acc + item.percentual, 0);
      this.mediaFrequencia = Math.round(soma / this.totalAlunos);
      
      const ordenados = [...this.dadosPresenca].sort((a, b) => b.percentual - a.percentual);
      this.maiorFrequencia = ordenados[0].percentual;
      this.melhorAluno = ordenados[0].nome;
      this.menorFrequencia = ordenados[ordenados.length - 1].percentual;
    }
  }

  getStatusClass(percentual: number): string {
    if (percentual >= 75) return 'status-high';
    if (percentual >= 50) return 'status-medium';
    return 'status-low';
  }

  getStatusLabel(percentual: number): string {
    if (percentual >= 75) return 'Excelente';
    if (percentual >= 50) return 'Regular';
    return 'Atenção';
  }

  getStrokeOffset(percentual: number): number {
    const circumference = 226.19; // 2 * PI * 36
    return circumference - (percentual / 100) * circumference;
  }

  // ------------------------------------------
  // LÓGICA DO DASHBOARD FINANCEIRO
  // ------------------------------------------
  initFinancialDates(): void {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 30);

    this.dataFim = this.formatDateISO(today);
    this.dataInicio = this.formatDateISO(oneMonthAgo);
  }

  formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  parseDate(d: any): Date {
    if (!d) return new Date(0);
    if (d instanceof Date) return d;
    if (typeof d === 'string') {
      const trimmed = d.trim();
      if (trimmed.includes('/')) {
        const [day, month, year] = trimmed.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      if (trimmed.includes('-')) {
        const parts = trimmed.split('T')[0].split('-').map(Number);
        if (parts.length === 3) {
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }
      }
      return new Date(trimmed);
    }
    return new Date(d);
  }

  formatDisplayDate(d: any): string {
    if (!d) return '-';
    if (typeof d === 'string') {
      const trimmed = d.trim();
      if (trimmed.includes('/')) return trimmed;
      if (trimmed.includes('-')) {
        const parts = trimmed.split('T')[0].split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }
    }
    const dateObj = this.parseDate(d);
    if (isNaN(dateObj.getTime()) || dateObj.getTime() === 0) return '-';
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  loadFilterOptions(): void {
    this.service.getCiclos().subscribe({
      next: (data) => this.ciclos = data || [],
      error: (err) => console.error('Erro ao carregar ciclos para filtro:', err)
    });

    this.service.getAlunos().subscribe({
      next: (data) => this.alunos = data || [],
      error: (err) => console.error('Erro ao carregar alunos para filtro:', err)
    });
  }

  loadFinancialData(): void {
    this.loadingFinanceiro = true;
    this.service.getTodosPagamentos().subscribe({
      next: (data) => {
        this.pagamentos = (data || []).filter(p => p && p.id != null);
        this.loadingFinanceiro = false;
        this.applyFinancialFilters();
      },
      error: (err) => {
        console.error('Erro ao carregar pagamentos:', err);
        this.loadingFinanceiro = false;
      }
    });
  }

  applyFinancialFilters(): void {
    let result = this.pagamentos.filter(p => p && p.id != null);

    // Filtro de Data Início
    if (this.dataInicio) {
      const inicio = this.parseDate(this.dataInicio);
      inicio.setHours(0, 0, 0, 0);
      result = result.filter(p => {
        const d = this.parseDate(p.data);
        return d >= inicio;
      });
    }

    // Filtro de Data Fim
    if (this.dataFim) {
      const fim = this.parseDate(this.dataFim);
      fim.setHours(23, 59, 59, 999);
      result = result.filter(p => {
        const d = this.parseDate(p.data);
        return d <= fim;
      });
    }

    // Filtro de Ciclo
    if (this.selectedCicloId) {
      const cId = +this.selectedCicloId;
      result = result.filter(p => p.cicloId === cId || (p.itens && p.itens.some((i: any) => i.cicloId === cId)));
    }

    // Filtro Multi-Select de Alunos
    if (this.selectedAlunoIds && this.selectedAlunoIds.length > 0) {
      result = result.filter(p => p.alunoId != null && this.selectedAlunoIds.includes(p.alunoId));
    }

    this.filteredPagamentos = result;
    this.calcularMetricasFinanceiras();
    this.gerarGraficoXY();
    this.sortFinancialTable();
  }

  // ------------------------------------------
  // MÉTODOS DO MULTI-SELECT DE ALUNOS
  // ------------------------------------------
  toggleAlunoDropdown(): void {
    this.alunoDropdownOpen = !this.alunoDropdownOpen;
  }

  isAlunoSelected(id: number): boolean {
    return this.selectedAlunoIds.includes(id);
  }

  toggleAlunoSelection(id: number): void {
    const idx = this.selectedAlunoIds.indexOf(id);
    if (idx > -1) {
      this.selectedAlunoIds.splice(idx, 1);
    } else {
      this.selectedAlunoIds.push(id);
    }
    this.applyFinancialFilters();
  }

  selectAllAlunos(): void {
    this.selectedAlunoIds = this.dropdownAlunosList.map(a => a.id);
    this.applyFinancialFilters();
  }

  clearAlunoSelection(): void {
    this.selectedAlunoIds = [];
    this.applyFinancialFilters();
  }

  getSelectedAlunosLabel(): string {
    if (this.selectedAlunoIds.length === 0) {
      return 'Todos os Alunos';
    }
    if (this.selectedAlunoIds.length === 1) {
      const aluno = this.alunos.find(a => a.id === this.selectedAlunoIds[0]);
      return aluno ? aluno.nome : '1 aluno selecionado';
    }
    return `${this.selectedAlunoIds.length} alunos selecionados`;
  }

  get dropdownAlunosList(): any[] {
    if (!this.alunoSearchTerm.trim()) return this.alunos;
    const term = this.alunoSearchTerm.toLowerCase();
    return this.alunos.filter(a => a.nome && a.nome.toLowerCase().includes(term));
  }

  setPreset(preset: string): void {
    this.selectedPreset = preset;
    const today = new Date();

    if (preset === '30d') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      this.dataInicio = this.formatDateISO(past);
      this.dataFim = this.formatDateISO(today);
    } else if (preset === 'mes') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      this.dataInicio = this.formatDateISO(firstDay);
      this.dataFim = this.formatDateISO(lastDay);
    } else if (preset === '3m') {
      const past = new Date();
      past.setMonth(today.getMonth() - 3);
      this.dataInicio = this.formatDateISO(past);
      this.dataFim = this.formatDateISO(today);
    } else if (preset === 'ano') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      this.dataInicio = this.formatDateISO(firstDay);
      this.dataFim = this.formatDateISO(today);
    } else if (preset === 'tudo') {
      this.dataInicio = '';
      this.dataFim = '';
    }

    this.applyFinancialFilters();
  }

  limparFiltros(): void {
    this.selectedCicloId = null;
    this.selectedAlunoIds = [];
    this.alunoSearchTerm = '';
    this.tableSearch = '';
    this.setPreset('30d');
  }

  calcularMetricasFinanceiras(): void {
    this.totalPagamentosCount = this.filteredPagamentos.length;
    if (this.totalPagamentosCount > 0) {
      this.totalReceita = this.filteredPagamentos.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
      this.ticketMedio = this.totalReceita / this.totalPagamentosCount;
      this.maiorPagamento = Math.max(...this.filteredPagamentos.map(p => Number(p.valor) || 0));
    } else {
      this.totalReceita = 0;
      this.ticketMedio = 0;
      this.maiorPagamento = 0;
    }
  }

  gerarGraficoXY(): void {
    if (this.filteredPagamentos.length === 0) {
      this.chartPoints = [];
      this.svgPathLine = '';
      this.svgPathArea = '';
      this.yAxisMarkers = [];
      return;
    }

    // 1. Agrupar por data (YYYY-MM-DD)
    const mapByDate = new Map<string, { valor: number; count: number; dateObj: Date }>();

    for (const p of this.filteredPagamentos) {
      const dObj = this.parseDate(p.data);
      const key = this.formatDateISO(dObj);
      const val = Number(p.valor) || 0;

      if (!mapByDate.has(key)) {
        mapByDate.set(key, { valor: val, count: 1, dateObj: dObj });
      } else {
        const item = mapByDate.get(key)!;
        item.valor += val;
        item.count += 1;
      }
    }

    // 2. Ordenar por data cronológica crescente
    const sortedKeys = Array.from(mapByDate.keys()).sort();

    // 3. Determinar Max Y
    let maxVal = 0;
    for (const key of sortedKeys) {
      const val = mapByDate.get(key)!.valor;
      if (val > maxVal) maxVal = val;
    }

    if (maxVal <= 0) maxVal = 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    this.maxYValue = Math.ceil(maxVal / magnitude) * magnitude;
    if (this.maxYValue === maxVal) this.maxYValue += magnitude;

    // 4. Parâmetros de projeção SVG (Largura 800, Altura 280)
    const svgWidth = 800;
    const svgHeight = 280;
    const paddingLeft = 70;
    const paddingRight = 40;
    const paddingTop = 30;
    const paddingBottom = 45;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    // Criar marcadores do eixo Y
    this.yAxisMarkers = [
      { label: `R$ ${this.maxYValue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, y: paddingTop },
      { label: `R$ ${(this.maxYValue * 0.75).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, y: paddingTop + plotHeight * 0.25 },
      { label: `R$ ${(this.maxYValue * 0.50).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, y: paddingTop + plotHeight * 0.50 },
      { label: `R$ ${(this.maxYValue * 0.25).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, y: paddingTop + plotHeight * 0.75 },
      { label: `R$ 0`, y: paddingTop + plotHeight }
    ];

    const points: ChartPoint[] = [];
    const count = sortedKeys.length;

    sortedKeys.forEach((key, idx) => {
      const entry = mapByDate.get(key)!;
      const x = count === 1
        ? paddingLeft + plotWidth / 2
        : paddingLeft + (idx / (count - 1)) * plotWidth;

      const yRatio = entry.valor / this.maxYValue;
      const y = paddingTop + plotHeight * (1 - yRatio);

      // Formatar rótulo da data para o eixo X (dd/MM)
      const dayStr = String(entry.dateObj.getDate()).padStart(2, '0');
      const monthStr = String(entry.dateObj.getMonth() + 1).padStart(2, '0');
      const formattedDate = `${dayStr}/${monthStr}`;

      points.push({
        dateStr: key,
        formattedDate: formattedDate,
        valor: entry.valor,
        count: entry.count,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10
      });
    });

    this.chartPoints = points;

    // 5. Construir caminho SVG da Linha e da Área com curvas suaves
    if (points.length === 1) {
      const p = points[0];
      this.svgPathLine = `M ${p.x - 30} ${p.y} L ${p.x + 30} ${p.y}`;
      const bottomY = paddingTop + plotHeight;
      this.svgPathArea = `M ${p.x - 30} ${bottomY} L ${p.x - 30} ${p.y} L ${p.x + 30} ${p.y} L ${p.x + 30} ${bottomY} Z`;
    } else {
      let linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX1 = prev.x + (curr.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (curr.x - prev.x) / 2;
        const cpY2 = curr.y;
        linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
      }
      this.svgPathLine = linePath;

      const bottomY = paddingTop + plotHeight;
      const firstX = points[0].x;
      const lastX = points[points.length - 1].x;
      this.svgPathArea = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    }
  }

  sortBy(col: string): void {
    if (this.sortColumn === col) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortColumn = col;
      this.sortAscending = true;
    }
    this.sortFinancialTable();
  }

  sortFinancialTable(): void {
    this.filteredPagamentos.sort((a, b) => {
      let valA: any = a[this.sortColumn];
      let valB: any = b[this.sortColumn];

      if (this.sortColumn === 'data') {
        const dateA = this.parseDate(a.data).getTime();
        const dateB = this.parseDate(b.data).getTime();
        return this.sortAscending ? dateA - dateB : dateB - dateA;
      }

      if (this.sortColumn === 'valor' || this.sortColumn === 'id') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return this.sortAscending ? numA - numB : numB - numA;
      }

      const strA = (valA || '').toString().toLowerCase();
      const strB = (valB || '').toString().toLowerCase();
      if (strA < strB) return this.sortAscending ? -1 : 1;
      if (strA > strB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  get displayedTableList(): any[] {
    const list = this.filteredPagamentos.filter(p => p && p.id != null);
    if (!this.tableSearch || !this.tableSearch.trim()) {
      return list;
    }
    const term = this.tableSearch.toLowerCase().trim();
    return list.filter(p => {
      const alunoMatch = (p.alunoNome || '').toLowerCase().includes(term);
      const cicloMatch = (p.cicloNome || '').toLowerCase().includes(term);
      const valorMatch = (p.valor || '').toString().includes(term);
      const dateMatch = this.formatDisplayDate(p.data).includes(term);
      return alunoMatch || cicloMatch || valorMatch || dateMatch;
    });
  }

  formatMoeda(val: number | null | undefined): string {
    if (val === null || val === undefined) return 'R$ 0,00';
    return (Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
