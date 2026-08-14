import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private service: GerenciadorAulasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('programaId');
      if (id) {
        this.programaId = +id;
      }
      this.loadAulas();
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
    this.router.navigate(['/aulas', aula.id, 'presencas']);
  }
}
