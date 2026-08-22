import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GerenciadorAulasService } from '../../../services/gerenciador-aulas.service';

@Component({
  selector: 'app-novo-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-aluno.component.html',
  styleUrl: './novo-aluno.component.css'
})
export class NovoAlunoComponent {
  nome: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  @Output() alunoCriado = new EventEmitter<any>();
  @Output() cancelado = new EventEmitter<void>();

  constructor(private service: GerenciadorAulasService) {}

  salvar() {
    if (!this.nome || !this.nome.trim()) {
      this.errorMessage = 'Por favor, informe o nome do aluno.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      nome: this.nome.trim()
    };

    this.service.criarAluno(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.nome = '';
        this.alunoCriado.emit(res);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Erro ao cadastrar aluno.';
        console.error('Erro ao cadastrar aluno:', err);
      }
    });
  }

  fechar() {
    this.nome = '';
    this.errorMessage = '';
    this.cancelado.emit();
  }
}
