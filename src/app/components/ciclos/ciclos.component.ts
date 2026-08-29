import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ciclos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ciclos.component.html',
  styleUrl: './ciclos.component.css'
})
export class CiclosComponent implements OnInit {
  ciclos: any[] = [];
  filteredCiclos: any[] = [];
  searchTerm: string = '';
  sortAscending: boolean = true;

  // Modals state
  showModal: boolean = false;
  modalLoading: boolean = false;
  errorMessage: string = '';
  
  nome: string = '';
  dataInicio: string = '';
  dataFim: string = '';
  
  isEditing: boolean = false;
  editingCicloId: number | null = null;

  showDeleteConfirmModal: boolean = false;
  cicloIdToDelete: number | null = null;
  deleteErrorMessage: string = '';
  deleteLoading: boolean = false;

  constructor(
    private service: GerenciadorAulasService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCiclos();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadCiclos() {
    this.service.getCiclos().subscribe({
      next: (data) => {
        this.ciclos = data || [];
        this.applyFilter();
      },
      error: (err) => {
        console.error('Erro ao carregar ciclos:', err);
      }
    });
  }

  applyFilter() {
    this.filteredCiclos = this.ciclos.filter(c => 
      c.nome?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.sortData();
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.sortData();
  }

  sortData() {
    this.filteredCiclos.sort((a, b) => {
      const nameA = a.nome?.toLowerCase() || '';
      const nameB = b.nome?.toLowerCase() || '';
      if (nameA < nameB) return this.sortAscending ? -1 : 1;
      if (nameA > nameB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  selectCiclo(ciclo: any) {
    this.router.navigate(['/ciclos', ciclo.id, 'programas'], {
      state: { cicloId: ciclo.id, cicloNome: ciclo.nome }
    });
  }

  openNovoCicloModal() {
    if (!this.isAdmin) return;
    this.isEditing = false;
    this.editingCicloId = null;
    this.nome = '';
    this.dataInicio = '';
    this.dataFim = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditarCicloModal(ciclo: any, event: Event) {
    event.stopPropagation();
    if (!this.isAdmin) return;
    this.isEditing = true;
    this.editingCicloId = ciclo.id;
    this.nome = ciclo.nome;
    // Format dates to yyyy-MM-dd for HTML date input
    this.dataInicio = ciclo.dataInicio ? ciclo.dataInicio.substring(0, 10) : '';
    this.dataFim = ciclo.dataFim ? ciclo.dataFim.substring(0, 10) : '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onSubmit() {
    if (!this.nome || !this.dataInicio || !this.dataFim) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    if (this.dataInicio > this.dataFim) {
      this.errorMessage = 'A data de início não pode ser posterior à data de fim.';
      return;
    }

    this.modalLoading = true;
    this.errorMessage = '';

    const payload = {
      nome: this.nome.trim(),
      dataInicio: this.dataInicio,
      dataFim: this.dataFim
    };

    if (this.isEditing) {
      this.service.atualizarCiclo(this.editingCicloId!, payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.showModal = false;
          this.loadCiclos();
        },
        error: (err) => {
          this.modalLoading = false;
          this.errorMessage = 'Erro ao atualizar ciclo.';
          console.error(err);
        }
      });
    } else {
      this.service.criarCiclo(payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.showModal = false;
          this.loadCiclos();
        },
        error: (err) => {
          this.modalLoading = false;
          this.errorMessage = 'Erro ao criar ciclo.';
          console.error(err);
        }
      });
    }
  }

  openDeletarCicloModal(id: number, event: Event) {
    event.stopPropagation();
    if (!this.isAdmin) return;
    this.cicloIdToDelete = id;
    this.deleteErrorMessage = '';
    this.deleteLoading = false;
    this.showDeleteConfirmModal = true;
  }

  confirmarDeletarCiclo() {
    if (this.cicloIdToDelete === null) return;
    this.deleteLoading = true;
    this.deleteErrorMessage = '';
    this.service.deletarCiclo(this.cicloIdToDelete).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteConfirmModal = false;
        this.cicloIdToDelete = null;
        this.loadCiclos();
      },
      error: (err) => {
        this.deleteLoading = false;
        this.deleteErrorMessage = 'Erro ao excluir ciclo. Verifique se existem matrículas vinculadas.';
        console.error(err);
      }
    });
  }
}
