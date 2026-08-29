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
  filteredMatriculas: Matricula[] = [];
  searchTerm: string = '';
  sortAscending: boolean = true;
  aulaId!: number;

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
    } else if (history.state) {
      this.cicloId = history.state['cicloId'] || null;
      this.cicloNome = history.state['cicloNome'] || '';
      this.programaId = history.state['programaId'] || null;
      this.programaNome = history.state['programaNome'] || '';
      this.aulaId = history.state['aulaId'] || null;
      this.aulaNome = history.state['aulaNome'] || '';
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
        this.loadPresencas();
      }
    });
  }

  loadPresencas() {
    if (!this.aulaId) return;
    this.service.getPresencasPorAula(this.aulaId).subscribe((data: Matricula[]) => {
      this.matriculas = data || [];
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filteredMatriculas = this.matriculas.filter(p =>
      p.alunoNome?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.sortData();
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.sortData();
  }

  sortData() {
    this.filteredMatriculas.sort((a, b) => {
      const nameA = a.alunoNome?.toLowerCase() || '';
      const nameB = b.alunoNome?.toLowerCase() || '';
      if (nameA < nameB) return this.sortAscending ? -1 : 1;
      if (nameA > nameB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  onTogglePresenca(matricula: Matricula, event?: Event) {
    if (!this.isAdmin) return;
    if (event && event.target) {
      matricula.presente = (event.target as HTMLInputElement).checked;
    }

    const matriculaId = matricula.id;

    if (matricula.presente) {
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
          matricula.presente = false; // Reverte na UI
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
            matricula.presente = true; // Reverte na UI
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
          aulaNome: this.aulaNome
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
