import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';

@Component({
  selector: 'app-presenca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presenca.component.html',
  styleUrl: './presenca.component.css'
})
export class PresencaComponent implements OnInit {
  alunos: any[] = [];
  filteredAlunos: any[] = [];
  searchTerm: string = '';
  sortAscending: boolean = true;
  aulaId!: number;

  constructor(
    private service: GerenciadorAulasService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('aulaId');
      if (id) {
        this.aulaId = +id;
        this.loadAlunos();
      }
    });
  }

  loadAlunos() {
    this.service.getPresencasPorAula(this.aulaId).subscribe(data => {
      // O backend deve retornar uma lista onde cada item tem 'nome', 'isPresente', 'idMatricula', etc.
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

  onTogglePresenca(aluno: any) {
    if (aluno.isPresente) {
      // Usuário marcou como presente (true)
      this.service.registrarPresenca(this.aulaId, aluno.idMatricula).subscribe({
        next: (res) => {
          aluno.idPresenca = res.id; // Salva o ID da presença criada para futura deleção
        },
        error: (err) => {
          console.error('Erro ao registrar presença', err);
          aluno.isPresente = false; // Reverte na UI
        }
      });
    } else {
      // Usuário desmarcou (false)
      if (aluno.idPresenca) {
        this.service.removerPresenca(aluno.idPresenca).subscribe({
          next: () => {
            aluno.idPresenca = null;
          },
          error: (err) => {
            console.error('Erro ao remover presença', err);
            aluno.isPresente = true; // Reverte na UI
          }
        });
      }
    }
  }
}
