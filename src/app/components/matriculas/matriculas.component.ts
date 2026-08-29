import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';
import { PagamentosComponent } from '../pagamentos/pagamentos.component';
import { DetalhesComponent } from '../alunos/detalhes/detalhes.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-matriculas',
  standalone: true,
  imports: [CommonModule, FormsModule, PagamentosComponent, DetalhesComponent],
  templateUrl: './matriculas.component.html',
  styleUrl: './matriculas.component.css'
})
export class MatriculasComponent implements OnInit {
  matriculas: any[] = [];
  alunoId!: number;
  alunoNome: string = '';
  activeTab: string = 'detalhes'; // Default tab (Detalhes on the left)

  // Modal State
  showModal: boolean = false;
  ciclos: any[] = [];
  programas: any[] = [];
  selectedCicloId: number | null = null;
  selectedProgramaId: number | null = null;
  modalLoading: boolean = false;
  errorMessage: string = '';
  valor: number | null = null;
  valorMensalidade: number | null = null;
  selectedDiaVencimento: number | null = null;
  diasDoMes: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  isEditing: boolean = false;
  editingMatriculaId: number | null = null;
  dataMatricula: string = '';
  sortColumn: string = 'id';
  sortAscending: boolean = true;
  showDeleteConfirmModal: boolean = false;
  matriculaIdToDelete: number | null = null;
  deleteErrorMessage: string = '';
  deleteLoading: boolean = false;

  constructor(
    private service: GerenciadorAulasService,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('alunoId');
      if (id) {
        this.alunoId = +id;
        this.loadAlunoInfo();
        this.loadMatriculas();
      }
    });
  }

  loadAlunoInfo() {
    this.service.getAlunos().subscribe({
      next: (alunos) => {
        const student = alunos.find((a: any) => a.id === this.alunoId);
        if (student) {
          this.alunoNome = student.nome;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar informações do aluno:', err);
      }
    });
  }

  loadMatriculas() {
    this.service.getMatriculas(this.alunoId).subscribe(data => {
      this.matriculas = data || [];
      this.sortData();
    });
  }

  openNovaMatriculaModal() {
    this.isEditing = false;
    this.editingMatriculaId = null;
    this.showModal = true;
    this.selectedCicloId = null;
    this.selectedProgramaId = null;
    this.programas = [];
    this.errorMessage = '';
    this.valor = null;
    this.valorMensalidade = null;
    this.selectedDiaVencimento = null;
    
    // Initialize dataMatricula with today's date in dd/MM/yyyy format
    const today = new Date();
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const yearStr = today.getFullYear();
    this.dataMatricula = `${dayStr}/${monthStr}/${yearStr}`;
    
    this.modalLoading = true;

    this.service.getCiclos().subscribe({
      next: (data) => {
        this.ciclos = data || [];
        this.modalLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erro ao carregar ciclos.';
        this.modalLoading = false;
        console.error(err);
      }
    });
  }

  onCicloChange() {
    this.selectedProgramaId = null;
    this.programas = [];
    if (this.selectedCicloId) {
      this.modalLoading = true;
      this.service.getProgramaAulas(this.selectedCicloId).subscribe({
        next: (data) => {
          this.programas = data || [];
          this.modalLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Erro ao carregar programas de aula.';
          this.modalLoading = false;
          console.error(err);
        }
      });
    }
  }

  salvarMatricula() {
    if (this.isEditing && this.editingMatriculaId) {
      this.modalLoading = true;
      this.errorMessage = '';
      const payload = {
        valor: this.valor,
        valorMensalidade: this.valorMensalidade,
        diaVencimento: this.selectedDiaVencimento
      };
      this.service.atualizarMatricula(this.editingMatriculaId, payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.showModal = false;
          this.loadMatriculas();
        },
        error: (err) => {
          this.modalLoading = false;
          this.errorMessage = 'Erro ao atualizar matrícula.';
          console.error(err);
        }
      });
      return;
    }

    if (!this.selectedProgramaId) {
      this.errorMessage = 'Por favor, selecione um programa de aula.';
      return;
    }

    this.modalLoading = true;
    this.errorMessage = '';

    // Construir o payload
    const payload = {
      alunoId: this.alunoId,
      programaAulaId: +this.selectedProgramaId,
      data: this.dataMatricula,
      valor: this.valor,
      valorMensalidade: this.valorMensalidade,
      diaVencimento: this.selectedDiaVencimento
    };

    this.service.criarMatricula(payload).subscribe({
      next: () => {
        this.modalLoading = false;
        this.showModal = false;
        this.loadMatriculas();
      },
      error: (err) => {
        this.modalLoading = false;
        this.errorMessage = 'Erro ao cadastrar matrícula.';
        console.error(err);
      }
    });
  }

  deletarMatricula(id: number, event: Event) {
    event.stopPropagation();
    this.showDeleteConfirmModal = true;
    this.matriculaIdToDelete = id;
    this.deleteErrorMessage = '';
    this.deleteLoading = false;
  }

  confirmarDeletarMatricula() {
    if (this.matriculaIdToDelete === null) return;
    this.deleteLoading = true;
    this.deleteErrorMessage = '';
    this.service.deletarMatricula(this.matriculaIdToDelete).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteConfirmModal = false;
        this.matriculaIdToDelete = null;
        this.loadMatriculas();
      },
      error: (err) => {
        this.deleteLoading = false;
        if (err.status === 500) {
          this.deleteErrorMessage = 'Existem presenças associadas a essa matrícula.';
        } else {
          this.deleteErrorMessage = 'Erro ao remover matrícula.';
        }
        console.error('Erro ao deletar matrícula:', err);
      }
    });
  }

  openEditarMatriculaModal(matricula: any) {
    if (!this.isAdmin) return;
    this.isEditing = true;
    this.editingMatriculaId = matricula.id;
    this.selectedCicloId = null;
    this.selectedProgramaId = matricula.programaAulaId;
    this.valor = matricula.valor;
    this.valorMensalidade = matricula.valorMensalidade;
    this.selectedDiaVencimento = matricula.diaVencimento;
    this.showModal = true;
    this.errorMessage = '';
  }

  toggleMatriculaAtiva(matricula: any, event: Event) {
    event.stopPropagation();
    if (!this.isAdmin) return;
    const originalState = matricula.flAtivo;
    this.service.atualizarStatusMatricula(matricula.id, matricula.flAtivo).subscribe({
      next: () => {
        // Success
      },
      error: (err) => {
        console.error('Erro ao atualizar status da matrícula:', err);
        matricula.flAtivo = originalState; // Revert status
      }
    });
  }

  goBack() {
    this.location.back();
  }

  formatMatriculaId(id: number | null | undefined): string {
    if (id === null || id === undefined) return '-';
    return String(id).padStart(5, '0');
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortColumn = column;
      this.sortAscending = true;
    }
    this.sortData();
  }

  sortData() {
    this.matriculas.sort((a, b) => {
      let valA: any = a[this.sortColumn];
      let valB: any = b[this.sortColumn];

      // Handle null/undefined values
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (this.sortColumn === 'data') {
        const dateA = valA ? new Date(valA).getTime() : 0;
        const dateB = valB ? new Date(valB).getTime() : 0;
        return this.sortAscending ? dateA - dateB : dateB - dateA;
      }

      if (this.sortColumn === 'id' || this.sortColumn === 'diaVencimento') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return this.sortAscending ? numA - numB : numB - numA;
      }

      // Default string comparison (e.g. for programaAulaNome)
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return this.sortAscending ? -1 : 1;
      if (strA > strB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  onAlunoAtualizado(aluno: any) {
    if (aluno && aluno.nome) {
      this.alunoNome = aluno.nome;
    }
  }
}
