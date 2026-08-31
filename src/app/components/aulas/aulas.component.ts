import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-aulas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aulas.component.html',
  styleUrl: './aulas.component.css'
})
export class AulasComponent implements OnInit {
  aulas: any[] = [];
  filteredAulas: any[] = [];
  searchTerm: string = '';
  sortAscending: boolean = true;
  programaId: number | null = null;

  cicloId: number | null = null;
  cicloNome: string = '';
  programaNome: string = '';

  // Modals state
  showModal: boolean = false;
  modalLoading: boolean = false;
  errorMessage: string = '';

  nome: string = '';
  data: string = '';

  isEditing: boolean = false;
  editingAulaId: number | null = null;

  showDeleteConfirmModal: boolean = false;
  aulaIdToDelete: number | null = null;
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
      this.programaNome = nav.extras.state['programaNome'] || '';
    } else if (history.state) {
      this.cicloId = history.state['cicloId'] || null;
      this.cicloNome = history.state['cicloNome'] || '';
      this.programaNome = history.state['programaNome'] || '';
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('programaId');
      if (id) {
        this.programaId = +id;
        if (!this.programaNome || !this.cicloId) {
          this.loadProgramaInfo();
        }
      }
      this.loadAulas();
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadProgramaInfo() {
    if (!this.programaId) return;
    this.service.getProgramaAulas().subscribe({
      next: (programas) => {
        const prog = (programas || []).find((p: any) => p.id === this.programaId);
        if (prog) {
          if (prog.nome) this.programaNome = prog.nome;
          if (prog.cicloId) this.cicloId = prog.cicloId;
          if (prog.ciclo?.id) this.cicloId = prog.ciclo.id;
          if (prog.ciclo?.nome) this.cicloNome = prog.ciclo.nome;
          else if (this.cicloId && !this.cicloNome) {
            this.service.getCicloPorId(this.cicloId).subscribe(c => {
              if (c && c.nome) this.cicloNome = c.nome;
            });
          }
        }
      }
    });
  }

  loadAulas() {
    this.service.getAulas(this.programaId || undefined).subscribe(data => {
      this.aulas = data || [];
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filteredAulas = this.aulas.filter(a => 
      a.nome?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.sortData();
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.sortData();
  }

  sortData() {
    this.filteredAulas.sort((a, b) => {
      const nameA = a.nome?.toLowerCase() || '';
      const nameB = b.nome?.toLowerCase() || '';
      if (nameA < nameB) return this.sortAscending ? -1 : 1;
      if (nameA > nameB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  formatData(dataInput: Date | string | null | undefined): string {
    if (!dataInput) return '';

    let d: Date;
    if (dataInput instanceof Date) {
      d = dataInput;
    } else if (typeof dataInput === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataInput)) {
        const [year, month, day] = dataInput.split('-').map(Number);
        d = new Date(year, month - 1, day);
      } else {
        d = new Date(dataInput);
      }
    } else {
      d = new Date(dataInput);
    }

    if (isNaN(d.getTime())) return '';

    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const diaSemana = diasSemana[d.getDay()];
    const diaNumero = d.getDate();
    const mesExtenso = meses[d.getMonth()];

    // Format hour and minute
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${diaSemana}, dia ${diaNumero} de ${mesExtenso} às ${hours}:${minutes}`;
  }

  selectAula(aula: any) {
    this.router.navigate(['/aulas', aula.id, 'presencas'], {
      state: {
        cicloId: this.cicloId,
        cicloNome: this.cicloNome,
        programaId: this.programaId,
        programaNome: this.programaNome,
        aulaId: aula.id,
        aulaNome: aula.nome
      }
    });
  }

  openNovaAulaModal() {
    if (!this.isAdmin) return;
    this.isEditing = false;
    this.editingAulaId = null;
    this.nome = '';
    
    // Default data field to current date/time in YYYY-MM-DDTHH:mm format
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
    this.data = localISOTime;
    
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditarAulaModal(aula: any, event: Event) {
    event.stopPropagation();
    if (!this.isAdmin) return;
    this.isEditing = true;
    this.editingAulaId = aula.id;
    this.nome = aula.nome;
    this.data = aula.data ? aula.data.substring(0, 16) : '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onSubmit() {
    if (!this.nome || !this.data) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    if (!this.programaId) {
      this.errorMessage = 'Identificador de programa de aula inválido.';
      return;
    }

    this.modalLoading = true;
    this.errorMessage = '';

    // Append seconds to match LocalDateTime expected format
    const formattedDateTime = this.data.length === 16 ? `${this.data}:00` : this.data;

    const payload = {
      nome: this.nome.trim(),
      data: formattedDateTime,
      programaAula: { id: this.programaId }
    };

    if (this.isEditing) {
      this.service.atualizarAula(this.editingAulaId!, payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.showModal = false;
          this.loadAulas();
        },
        error: (err) => {
          this.modalLoading = false;
          this.errorMessage = 'Erro ao atualizar aula.';
          console.error(err);
        }
      });
    } else {
      this.service.criarAula(payload).subscribe({
        next: () => {
          this.modalLoading = false;
          this.showModal = false;
          this.loadAulas();
        },
        error: (err) => {
          this.modalLoading = false;
          this.errorMessage = 'Erro ao criar aula.';
          console.error(err);
        }
      });
    }
  }

  openDeletarAulaModal(id: number, event: Event) {
    event.stopPropagation();
    if (!this.isAdmin) return;
    this.aulaIdToDelete = id;
    this.deleteErrorMessage = '';
    this.deleteLoading = false;
    this.showDeleteConfirmModal = true;
  }

  confirmarDeletarAula() {
    if (this.aulaIdToDelete === null) return;
    this.deleteLoading = true;
    this.deleteErrorMessage = '';
    this.service.deletarAula(this.aulaIdToDelete).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteConfirmModal = false;
        this.aulaIdToDelete = null;
        this.loadAulas();
      },
      error: (err) => {
        this.deleteLoading = false;
        this.deleteErrorMessage = err.error?.message || err.error?.error || 'Não é possível excluir a aula pois existem presenças registradas.';
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

  goToAulas() {
    if (this.programaId) {
      this.router.navigate(['/programas', this.programaId, 'aulas'], {
        state: {
          cicloId: this.cicloId,
          cicloNome: this.cicloNome,
          programaId: this.programaId,
          programaNome: this.programaNome
        }
      });
    } else {
      this.router.navigate(['/aulas']);
    }
  }

  goBack() {
    this.location.back();
  }
}
