import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';

@Component({
  selector: 'app-matriculas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matriculas.component.html',
  styleUrl: './matriculas.component.css'
})
export class MatriculasComponent implements OnInit {
  matriculas: any[] = [];
  alunoId!: number;
  alunoNome: string = '';

  // Modal State
  showModal: boolean = false;
  ciclos: any[] = [];
  programas: any[] = [];
  selectedCicloId: number | null = null;
  selectedProgramaId: number | null = null;
  modalLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private service: GerenciadorAulasService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('alunoId');
      if (id) {
        this.alunoId = +id;
        this.loadAlunoInfo();
        this.loadMatriculas();
      }
    });
  }

  loadAlunoInfo() {
    this.service.getAlunos().subscribe({
      next: (alunos) => {
        const student = alunos.find((a: any) => a.id === this.alunoId);
        if (student) {
          this.alunoNome = student.nome;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar informações do aluno:', err);
      }
    });
  }

  loadMatriculas() {
    this.service.getMatriculas(this.alunoId).subscribe(data => {
      this.matriculas = data;
    });
  }

  openNovaMatriculaModal() {
    this.showModal = true;
    this.selectedCicloId = null;
    this.selectedProgramaId = null;
    this.programas = [];
    this.errorMessage = '';
    this.modalLoading = true;

    this.service.getCiclos().subscribe({
      next: (data) => {
        this.ciclos = data || [];
        this.modalLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erro ao carregar ciclos.';
        this.modalLoading = false;
        console.error(err);
      }
    });
  }

  onCicloChange() {
    this.selectedProgramaId = null;
    this.programas = [];
    if (this.selectedCicloId) {
      this.modalLoading = true;
      this.service.getProgramaAulas(this.selectedCicloId).subscribe({
        next: (data) => {
          this.programas = data || [];
          this.modalLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Erro ao carregar programas de aula.';
          this.modalLoading = false;
          console.error(err);
        }
      });
    }
  }

  salvarMatricula() {
    if (!this.selectedProgramaId) {
      this.errorMessage = 'Por favor, selecione um programa de aula.';
      return;
    }

    this.modalLoading = true;
    this.errorMessage = '';

    // Formatar data local como YYYY-MM-DD para evitar problemas de fuso horário
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;

    // Construir o payload apenas com alunoId, programaAulaId e data
    const payload = {
      alunoId: this.alunoId,
      programaAulaId: +this.selectedProgramaId,
      data: localDateStr
    };

    this.service.criarMatricula(payload).subscribe({
      next: () => {
        this.modalLoading = false;
        this.showModal = false;
        this.loadMatriculas();
      },
      error: (err) => {
        this.modalLoading = false;
        this.errorMessage = 'Erro ao cadastrar matrícula.';
        console.error(err);
      }
    });
  }

  deletarMatricula(id: number) {
    if (confirm('Tem certeza que deseja remover esta matrícula?')) {
      this.service.deletarMatricula(id).subscribe({
        next: () => {
          this.loadMatriculas();
        },
        error: (err) => {
          console.error('Erro ao deletar matrícula:', err);
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
