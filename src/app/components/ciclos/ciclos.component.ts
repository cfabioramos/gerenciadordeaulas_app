import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';

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

  constructor(
    private service: GerenciadorAulasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.service.getCiclos().subscribe(data => {
      this.ciclos = data;
      this.applyFilter();
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
      state: { cicloNome: ciclo.nome }
    });
  }
}
