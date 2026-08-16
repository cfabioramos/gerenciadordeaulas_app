import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';

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

  constructor(
    private service: GerenciadorAulasService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state?.['cicloNome']) {
      this.cicloNome = nav.extras.state['cicloNome'];
    } else if (history.state?.['cicloNome']) {
      this.cicloNome = history.state['cicloNome'];
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
    });
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
      this.programas = data;
      this.applyFilter();
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
        cicloNome: this.cicloNome,
        programaNome: programa.nome
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
