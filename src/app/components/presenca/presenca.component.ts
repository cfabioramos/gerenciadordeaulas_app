import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';
import { AuthService } from '../../services/auth.service';

export interface Matricula {
  alunoId: number;
  alunoNome: string;
  data: string;
  id: number;
  presencaId: number | null;
  presente: boolean;
  programaAulaId: number;
  programaAulaNome: string;
  flAtivo?: boolean;
}

@Component({
  selector: 'app-presenca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presenca.component.html',
  styleUrl: './presenca.component.css'
})
export class PresencaComponent implements OnInit {
  matriculas: Matricula[] = [];
  filteredMatriculasAtivas: Matricula[] = [];
  filteredMatriculasInativas: Matricula[] = [];
  searchTerm: string = '';
  sortAscending: boolean = true;
  aulaId!: number;
  aulaData: string | null = null;
  isAulaHoje: boolean = false;
  errorMessage: string = '';

  cicloId: number | null = null;
  programaId: number | null = null;
  cicloNome: string = '';
  programaNome: string = '';
  aulaNome: string = '';

  constructor(
    private service: GerenciadorAulasService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private authService: AuthService
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.cicloId = nav.extras.state['cicloId'] || null;
      this.cicloNome = nav.extras.state['cicloNome'] || '';
      this.programaId = nav.extras.state['programaId'] || null;
      this.programaNome = nav.extras.state['programaNome'] || '';
      this.aulaId = nav.extras.state['aulaId'] || null;
      this.aulaNome = nav.extras.state['aulaNome'] || '';
      if (nav.extras.state['aulaData']) {
        this.aulaData = nav.extras.state['aulaData'];
        this.isAulaHoje = this.checkIsHoje(this.aulaData);
      }
    } else if (history.state) {
      this.cicloId = history.state['cicloId'] || null;
      this.cicloNome = history.state['cicloNome'] || '';
      this.programaId = history.state['programaId'] || null;
      this.programaNome = history.state['programaNome'] || '';
      this.aulaId = history.state['aulaId'] || null;
      this.aulaNome = history.state['aulaNome'] || '';
      if (history.state['aulaData']) {
        this.aulaData = history.state['aulaData'];
        this.isAulaHoje = this.checkIsHoje(this.aulaData);
      }
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('aulaId');
      if (id) {
        this.aulaId = +id;
        this.loadAulaDetails();
        this.loadPresencas();
      }
    });
  }

  loadAulaDetails() {
    if (!this.aulaId) return;
    this.service.getAulaPorId(this.aulaId).subscribe({
      next: (aula) => {
        if (aula) {
          if (!this.aulaNome && aula.nome) this.aulaNome = aula.nome;
          this.aulaData = aula.data;
          this.isAulaHoje = this.checkIsHoje(aula.data);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes da aula:', err);
      }
    });
  }

  checkIsHoje(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  }

  canEditPresenca(matricula: Matricula): boolean {
    return this.isAdmin && this.isAulaHoje && (matricula.flAtivo !== false);
  }

  loadPresencas() {
    if (!this.aulaId) return;
    this.service.getPresencasPorAula(this.aulaId).subscribe((data: Matricula[]) => {
      this.matriculas = data || [];
      this.applyFilter();
    });
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    
    // Separate active and inactive matriculas
    const ativas = this.matriculas.filter(m => m.flAtivo !== false && (m.alunoNome?.toLowerCase().includes(term) ?? false));
    const inativas = this.matriculas.filter(m => m.flAtivo === false && (m.alunoNome?.toLowerCase().includes(term) ?? false));

    this.filteredMatriculasAtivas = this.sortList(ativas);
    this.filteredMatriculasInativas = this.sortList(inativas);
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.filteredMatriculasAtivas = this.sortList(this.filteredMatriculasAtivas);
    this.filteredMatriculasInativas = this.sortList(this.filteredMatriculasInativas);
  }

  private sortList(list: Matricula[]): Matricula[] {
    return [...list].sort((a, b) => {
      const nameA = a.alunoNome?.toLowerCase() || '';
      const nameB = b.alunoNome?.toLowerCase() || '';
      if (nameA < nameB) return this.sortAscending ? -1 : 1;
      if (nameA > nameB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  onTogglePresenca(matricula: Matricula, event?: Event) {
    if (!this.canEditPresenca(matricula)) {
      if (event && event.target) {
        (event.target as HTMLInputElement).checked = !!matricula.presente;
      }
      return;
    }

    this.errorMessage = '';
    const target = event?.target as HTMLInputElement;
    const originalState = matricula.presente;
    const newState = target ? target.checked : !originalState;
    matricula.presente = newState;

    const matriculaId = matricula.id;

    if (newState) {
      // Usuário marcou como presente (true)
      this.service.registrarPresenca(this.aulaId, matriculaId).subscribe({
        next: (res) => {
          if (res && res.id) {
            matricula.presencaId = res.id;
          } else if (typeof res === 'number') {
            matricula.presencaId = res;
          }
        },
        error: (err) => {
          console.error('Erro ao registrar presença', err);
          this.errorMessage = err.error?.message || err.error?.error || 'Erro ao registrar presença.';
          matricula.presente = originalState; // Reverte na UI
          if (target) target.checked = originalState;
        }
      });
    } else {
      // Usuário desmarcou (false)
      const presencaId = matricula.presencaId;
      if (presencaId) {
        this.service.removerPresenca(presencaId).subscribe({
          next: () => {
            matricula.presencaId = null;
          },
          error: (err) => {
            console.error('Erro ao remover presença', err);
            this.errorMessage = err.error?.message || err.error?.error || 'Erro ao remover presença.';
            matricula.presente = originalState; // Reverte na UI
            if (target) target.checked = originalState;
          }
        });
      }
    }
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

  goToPresencas() {
    if (this.aulaId) {
      this.router.navigate(['/aulas', this.aulaId, 'presencas'], {
        state: {
          cicloId: this.cicloId,
          cicloNome: this.cicloNome,
          programaId: this.programaId,
          programaNome: this.programaNome,
          aulaId: this.aulaId,
          aulaNome: this.aulaNome,
          aulaData: this.aulaData
        }
      });
    } else {
      this.router.navigate(['/presenca']);
    }
  }

  goBack() {
    this.location.back();
  }
}
