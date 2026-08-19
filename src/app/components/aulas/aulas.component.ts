import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';

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

  constructor(
    private service: GerenciadorAulasService,
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
      this.aulas = data;
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
