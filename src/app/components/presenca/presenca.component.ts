import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  cicloNome: string = '';
  programaNome: string = '';
  aulaNome: string = '';

  constructor(
    private service: GerenciadorAulasService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.cicloNome = nav.extras.state['cicloNome'] || '';
      this.programaNome = nav.extras.state['programaNome'] || '';
      this.aulaNome = nav.extras.state['aulaNome'] || '';
    } else if (history.state) {
      this.cicloNome = history.state['cicloNome'] || '';
      this.programaNome = history.state['programaNome'] || '';
      this.aulaNome = history.state['aulaNome'] || '';
    }
  }

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
      this.alunos = (data || []).map((a: any) => {
        const isPresente = Boolean(
          a.isPresente ?? 
          a.presente ?? 
          a.present ?? 
          (a.idPresenca !== null && a.idPresenca !== undefined && a.idPresenca !== 0)
        );

        return {
          ...a,
          isPresente: isPresente,
          idMatricula: a.idMatricula ?? a.matriculaId ?? a.matricula?.id ?? a.id
        };
      });
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

  onTogglePresenca(aluno: any, event?: Event) {
    if (event && event.target) {
      aluno.isPresente = (event.target as HTMLInputElement).checked;
    }

    const matriculaId = aluno.idMatricula ?? aluno.matriculaId ?? aluno.id;

    if (aluno.isPresente) {
      // Usuário marcou como presente (true)
      this.service.registrarPresenca(this.aulaId, matriculaId).subscribe({
        next: (res) => {
          if (res && res.id) {
            aluno.idPresenca = res.id;
          }
        },
        error: (err) => {
          console.error('Erro ao registrar presença', err);
          aluno.isPresente = false; // Reverte na UI
        }
      });
    } else {
      // Usuário desmarcou (false)
      const presencaId = aluno.idPresenca ?? aluno.id;
      if (presencaId) {
        this.service.removerPresenca(presencaId).subscribe({
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

  goBack() {
    this.location.back();
  }
}
