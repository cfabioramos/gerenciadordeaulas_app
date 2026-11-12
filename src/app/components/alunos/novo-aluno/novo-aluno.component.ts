import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { AppLogger } from '../../../utils/app-logger';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GerenciadorAulasService } from '../../../services/gerenciador-aulas.service';
import { Aluno } from '../../../models/aluno.model';

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

  @Output() alunoCriado = new EventEmitter<Aluno>();
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
        this.alunoCriado.emit(res as Aluno);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Erro ao cadastrar aluno.';
        AppLogger.error('Erro ao cadastrar aluno:', err);
      }
    });
  }

  fechar() {
    this.nome = '';
    this.errorMessage = '';
    this.cancelado.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.fechar();
  }
}
