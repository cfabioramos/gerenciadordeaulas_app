import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-programa-aulas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programa-aulas.component.html',
  styleUrl: './programa-aulas.component.css'
})
export class ProgramaAulasComponent implements OnInit {
  programas: any[] = [];
  filteredProgramas: any[] = [];
  searchTerm: string = '';
  sortAscending: boolean = true;
  cicloId: number | null = null;
  cicloNome: string = '';

  // Modals state
  showModal: boolean = false;
  modalLoading: boolean = false;
  errorMessage: string = '';

  nome: string = '';
  tipoAulaId: number | null = null;
  tipoAulas: any[] = [];

  isEditing: boolean = false;
  editingProgramaId: number | null = null;

  showDeleteConfirmModal: boolean = false;
  programaIdToDelete: number | null = null;
  deleteErrorMessage: string = '';
  deleteLoading: boolean = false;

  constructor(
    private service: GerenciadorAulasService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.cicloId = nav.extras.state['cicloId'] || null;
      this.cicloNome = nav.extras.state['cicloNome'] || '';
    } else if (history.state) {
      this.cicloId = history.state['cicloId'] || null;
      this.cicloNome = history.state['cicloNome'] || '';
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('cicloId');
      if (id) {
        this.cicloId = +id;
        if (!this.cicloNome) {
          this.loadCicloInfo();
        }
      }
      this.loadProgramas();
      this.loadTipoAulas();
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadCicloInfo() {
    if (!this.cicloId) return;
    this.service.getCiclos().subscribe({
      next: (ciclos) => {
        const ciclo = (ciclos || []).find((c: any) => c.id === this.cicloId);
        if (ciclo && ciclo.nome) {
          this.cicloNome = ciclo.nome;
        }
      },
      error: () => {
        if (this.cicloId) {
          this.service.getCicloPorId(this.cicloId).subscribe(c => {
            if (c && c.nome) {
              this.cicloNome = c.nome;
            }
          });
        }
      }
    });
  }

  loadProgramas() {
    this.service.getProgramaAulas(this.cicloId || undefined).subscribe(data => {
      this.programas = data || [];
      this.applyFilter();
    });
  }

  loadTipoAulas() {
    this.service.getTipoAulas().subscribe({
      next: (data) => {
        this.tipoAulas = data || [];
      },
      error: (err) => {
        console.error('Erro ao carregar tipos de aula:', err);
      }
    });
  }

  applyFilter() {
    this.filteredProgramas = this.programas.filter(p => 
      p.nome?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.sortData();
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.sortData();
  }

  sortData() {
    this.filteredProgramas.sort((a, b) => {
      const nameA = a.nome?.toLowerCase() || '';
      const nameB = b.nome?.toLowerCase() || '';
      if (nameA < nameB) return this.sortAscending ? -1 : 1;
      if (nameA > nameB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  selectPrograma(programa: any) {
    this.router.navigate(['/programas', programa.id, 'aulas'], {
      state: {
        cicloId: this.cicloId,
        cicloNome: this.cicloNome,
        programaId: programa.id,
        programaNome: programa.nome
      }
    });
  }

  openNovoProgramaModal() {
    if (!this.isAdmin) return;
    this.isEditing = false;
    this.editingProgramaId = null;
    this.nome = '';
    this.tipoAulaId = this.tipoAulas.length > 0 ? this.tipoAulas[0].id : null;
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditarProgramaModal(programa: any, event: Event) {
    event.stopPropagation();
    if (!this.isAdmin) return;
    this.isEditing = true;
    this.editingProgramaId = programa.id;
    this.nome = programa.nome;
    this.tipoAulaId = programa.tipoAulaId || (this.tipoAulas.length > 0 ? this.tipoAulas[0].id : null);
    this.errorMessage = '';
    this.showModal = true;
  }

  onSubmit() {
    if (!this.nome) {
      this.errorMessage = 'Por favor, preencha o nome do programa.';
      return;
    }

    if (!this.cicloId) {
      this.errorMessage = 'Identificador de ciclo inválido.';
      return;
    }

    this.modalLoading = true;
    this.errorMessage = '';

    const payload = {
      nome: this.nome.trim(),
      ciclo: { id: this.cicloId },
      tipoAula: this.tipoAulaId ? { id: this.tipoAulaId } : null
    };

    if (this.isEditing) {
      this.service.atualizarProgramaAula(this.editingProgramaId!, payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.showModal = false;
          this.loadProgramas();
        },
        error: (err) => {
          this.modalLoading = false;
          this.errorMessage = 'Erro ao atualizar programa de aulas.';
          console.error(err);
        }
      });
    } else {
      this.service.criarProgramaAula(payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.showModal = false;
          this.loadProgramas();
        },
        error: (err) => {
          this.modalLoading = false;
          this.errorMessage = 'Erro ao criar programa de aulas.';
          console.error(err);
        }
      });
    }
  }

  openDeletarProgramaModal(id: number, event: Event) {
    event.stopPropagation();
    if (!this.isAdmin) return;
    this.programaIdToDelete = id;
    this.deleteErrorMessage = '';
    this.deleteLoading = false;
    this.showDeleteConfirmModal = true;
  }

  confirmarDeletarPrograma() {
    if (this.programaIdToDelete === null) return;
    this.deleteLoading = true;
    this.deleteErrorMessage = '';
    this.service.deletarProgramaAula(this.programaIdToDelete).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteConfirmModal = false;
        this.programaIdToDelete = null;
        this.loadProgramas();
      },
      error: (err) => {
        this.deleteLoading = false;
        this.deleteErrorMessage = 'Erro ao excluir programa de aulas. Verifique se existem matrículas ou aulas vinculadas.';
        console.error(err);
      }
    });
  }

  goToCiclos() {
    this.router.navigate(['/ciclos']);
  }

  goToProgramas() {
    if (this.cicloId) {
      this.router.navigate(['/ciclos', this.cicloId, 'programas'], {
        state: { cicloId: this.cicloId, cicloNome: this.cicloNome }
      });
    } else {
      this.router.navigate(['/programas']);
    }
  }

  goBack() {
    this.location.back();
  }
}
