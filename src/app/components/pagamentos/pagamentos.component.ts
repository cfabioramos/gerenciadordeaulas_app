import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagamentos.component.html',
  styleUrl: './pagamentos.component.css'
})
export class PagamentosComponent implements OnInit, OnChanges {
  @Input() alunoId!: number;

  pagamentos: any[] = [];
  activeMatriculas: any[] = [];
  
  showModal: boolean = false;
  modalLoading: boolean = false;
  errorMessage: string = '';
  
  valor: number | null = null;
  dataPagamento: string = '';
  selectedMatriculaIds: { [id: number]: boolean } = {};
  
  isEditing: boolean = false;
  editingPagamentoId: number | null = null;

  showDeleteConfirmModal: boolean = false;
  pagamentoIdToDelete: number | null = null;
  deleteErrorMessage: string = '';
  deleteLoading: boolean = false;

  constructor(private service: GerenciadorAulasService) {}

  ngOnInit(): void {
    if (this.alunoId) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alunoId'] && !changes['alunoId'].firstChange) {
      this.loadData();
    }
  }

  loadData() {
    this.loadPagamentos();
    this.loadActiveMatriculas();
  }

  loadPagamentos() {
    this.service.getPagamentos(this.alunoId).subscribe({
      next: (data) => {
        this.pagamentos = data || [];
      },
      error: (err) => {
        console.error('Erro ao carregar pagamentos:', err);
      }
    });
  }

  loadActiveMatriculas() {
    this.service.getMatriculas(this.alunoId).subscribe({
      next: (data) => {
        const todayStr = new Date().toISOString().substring(0, 10);
        this.activeMatriculas = (data || []).filter((m: any) => {
          return m.flAtivo && 
                 (!m.cicloDataInicio || m.cicloDataInicio <= todayStr) && 
                 (!m.cicloDataFim || m.cicloDataFim >= todayStr);
        });
      },
      error: (err) => {
        console.error('Erro ao carregar matrículas:', err);
      }
    });
  }

  getTodayDateString(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

  openNovoPagamentoModal() {
    this.isEditing = false;
    this.editingPagamentoId = null;
    this.valor = null;
    this.dataPagamento = this.getTodayDateString();
    this.selectedMatriculaIds = {};
    
    // Auto-select all active matriculas by default
    this.activeMatriculas.forEach(m => {
      this.selectedMatriculaIds[m.id] = true;
    });

    // Auto-calculate the sum of the monthly payments of selected registrations as the default value
    this.recalculateTotalValue();

    this.errorMessage = '';
    this.showModal = true;
  }

  recalculateTotalValue() {
    if (this.isEditing) return;
    let total = 0;
    this.activeMatriculas.forEach(m => {
      if (this.selectedMatriculaIds[m.id]) {
        total += m.valorMensalidade || 0;
      }
    });
    this.valor = total > 0 ? total : null;
  }

  openEditarPagamentoModal(pagamento: any, event: Event) {
    event.stopPropagation();
    this.isEditing = true;
    this.editingPagamentoId = pagamento.id;
    this.valor = pagamento.valor;
    this.dataPagamento = pagamento.data; // Already formatted as dd/MM/yyyy
    this.errorMessage = '';
    this.showModal = true;
  }

  onSubmit() {
    if (this.valor === null || this.valor <= 0) {
      this.errorMessage = 'Por favor, informe um valor válido para o pagamento.';
      return;
    }
    if (!this.dataPagamento) {
      this.errorMessage = 'Por favor, informe a data do pagamento.';
      return;
    }

    this.modalLoading = true;
    this.errorMessage = '';

    if (this.isEditing) {
      const payload = {
        valor: this.valor,
        data: this.dataPagamento
      };
      this.service.atualizarPagamento(this.editingPagamentoId!, payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.showModal = false;
          this.loadPagamentos();
        },
        error: (err) => {
          this.modalLoading = false;
          this.errorMessage = 'Erro ao editar pagamento.';
          console.error(err);
        }
      });
    } else {
      const matriculaIds = Object.keys(this.selectedMatriculaIds)
        .filter(id => this.selectedMatriculaIds[+id])
        .map(id => +id);

      if (matriculaIds.length === 0) {
        this.modalLoading = false;
        this.errorMessage = 'Selecione pelo menos um programa de aula para o pagamento.';
        return;
      }

      const payload = {
        valor: this.valor,
        data: this.dataPagamento,
        matriculaIds: matriculaIds
      };

      this.service.criarPagamento(payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.showModal = false;
          this.loadPagamentos();
        },
        error: (err) => {
          this.modalLoading = false;
          this.errorMessage = 'Erro ao registrar pagamento.';
          console.error(err);
        }
      });
    }
  }

  deletarPagamento(id: number, event: Event) {
    event.stopPropagation();
    this.showDeleteConfirmModal = true;
    this.pagamentoIdToDelete = id;
    this.deleteErrorMessage = '';
    this.deleteLoading = false;
  }

  confirmarDeletarPagamento() {
    if (this.pagamentoIdToDelete === null) return;
    this.deleteLoading = true;
    this.deleteErrorMessage = '';
    this.service.deletarPagamento(this.pagamentoIdToDelete).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteConfirmModal = false;
        this.pagamentoIdToDelete = null;
        this.loadPagamentos();
      },
      error: (err) => {
        this.deleteLoading = false;
        this.deleteErrorMessage = 'Erro ao estornar pagamento.';
        console.error('Erro ao deletar pagamento:', err);
      }
    });
  }

  formatProgramas(itens: any[]): string {
    if (!itens || itens.length === 0) return '-';
    return itens.map(i => `${i.programaAulaNome} (R$ ${i.valorMensalidadeDia})`).join(', ');
  }

  getDiscountPercentage(pagamento: any): string {
    if (!pagamento.itens || pagamento.itens.length === 0) return '0%';
    const totalMensalidades = pagamento.itens.reduce((sum: number, item: any) => sum + (item.valorMensalidadeDia || 0), 0);
    if (totalMensalidades <= 0) return '0%';
    const discount = ((totalMensalidades - (pagamento.valor || 0)) / totalMensalidades) * 100;
    if (discount <= 0) return '0%';
    return Math.max(0, discount).toFixed(0) + '%';
  }

  get discountInfo(): string {
    let totalMensalidades = 0;
    if (this.isEditing) {
      const pagamento = this.pagamentos.find(p => p.id === this.editingPagamentoId);
      if (pagamento && pagamento.itens) {
        totalMensalidades = pagamento.itens.reduce((sum: number, item: any) => sum + (item.valorMensalidadeDia || 0), 0);
      }
    } else {
      this.activeMatriculas.forEach(m => {
        if (this.selectedMatriculaIds[m.id]) {
          totalMensalidades += m.valorMensalidade || 0;
        }
      });
    }

    if (totalMensalidades <= 0) return '';
    const valorPago = this.valor || 0;
    const diff = totalMensalidades - valorPago;

    if (diff <= 0) {
      return 'Sem desconto (Valor integral ou maior)';
    }

    const pct = (diff / totalMensalidades) * 100;
    const formattedDiff = diff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formattedPct = pct.toFixed(0) + '%';
    
    return `Desconto aplicado: ${formattedDiff} (${formattedPct})`;
  }
}
