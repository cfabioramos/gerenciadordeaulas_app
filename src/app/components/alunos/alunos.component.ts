import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';
import { NovoAlunoComponent } from './novo-aluno/novo-aluno.component';

@Component({
  selector: 'app-alunos',
  standalone: true,
  imports: [CommonModule, FormsModule, NovoAlunoComponent],
  templateUrl: './alunos.component.html',
  styleUrl: './alunos.component.css'
})
export class AlunosComponent implements OnInit {
  alunos: any[] = [];
  filteredAlunos: any[] = [];
  searchTerm: string = '';
  sortAscending: boolean = true;
  showNovoAlunoModal: boolean = false;

  constructor(
    private service: GerenciadorAulasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAlunos();
  }

  loadAlunos() {
    this.service.getAlunos().subscribe(data => {
      this.alunos = data;
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filteredAlunos = this.alunos.filter(a => 
      a.nome?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.sortData();
  }

  toggleSort() {
    this.sortAscending = !this.sortAscending;
    this.sortData();
  }

  sortData() {
    this.filteredAlunos.sort((a, b) => {
      const nameA = a.nome?.toLowerCase() || '';
      const nameB = b.nome?.toLowerCase() || '';
      if (nameA < nameB) return this.sortAscending ? -1 : 1;
      if (nameA > nameB) return this.sortAscending ? 1 : -1;
      return 0;
    });
  }

  selectAluno(aluno: any) {
    this.router.navigate(['/alunos', aluno.id, 'matriculas']);
  }

  onAlunoCriado(novoAluno: any) {
    this.showNovoAlunoModal = false;
    this.loadAlunos();
  }
}
