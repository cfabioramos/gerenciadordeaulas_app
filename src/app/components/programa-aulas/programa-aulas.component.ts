import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private service: GerenciadorAulasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('cicloId');
      if (id) {
        this.cicloId = +id;
      }
      this.loadProgramas();
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
    this.router.navigate(['/programas', programa.id, 'aulas']);
  }
}
