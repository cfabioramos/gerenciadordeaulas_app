import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GerenciadorAulasService } from '../../../services/gerenciador-aulas.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent implements OnInit, OnChanges {
  @Input() alunoId!: number;
  @Output() alunoAtualizado = new EventEmitter<any>();

  alunoNome: string = '';
  originalNome: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private service: GerenciadorAulasService,
    private authService: AuthService
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    if (this.alunoId) {
      this.carregarAluno();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alunoId'] && !changes['alunoId'].firstChange) {
      this.carregarAluno();
    }
  }

  carregarAluno() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.service.getAlunoPorId(this.alunoId).subscribe({
      next: (aluno) => {
        this.alunoNome = aluno.nome;
        this.originalNome = aluno.nome;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erro ao carregar dados do aluno.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  salvar() {
    if (!this.alunoNome || !this.alunoNome.trim()) {
      this.errorMessage = 'O nome do aluno não pode ser vazio.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      nome: this.alunoNome.trim()
    };

    this.service.atualizarAluno(this.alunoId, payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.originalNome = res.nome;
        this.alunoNome = res.nome;
        this.successMessage = 'Nome do aluno atualizado com sucesso!';
        this.alunoAtualizado.emit(res);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Erro ao atualizar nome do aluno.';
        console.error('Erro ao atualizar aluno:', err);
      }
    });
  }

  resetForm() {
    this.alunoNome = this.originalNome;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
