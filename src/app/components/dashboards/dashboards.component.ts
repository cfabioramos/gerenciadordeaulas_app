import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AlunoFrequencia {
  nome: string;
  percentual: number;
}

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboards.component.html',
  styleUrl: './dashboards.component.css'
})
export class DashboardsComponent implements OnInit {
  dadosPresenca: AlunoFrequencia[] = [
    { nome: "Ciro Jobart", percentual: 99 },
    { nome: "Carlos Fábio", percentual: 95 },
    { nome: "Jao", percentual: 80 },
    { nome: "Letícia", percentual: 70 },
    { nome: "Josefa", percentual: 40 },
    { nome: "Guilhermina", percentual: 30 }
  ];

  totalAlunos: number = 0;
  mediaFrequencia: number = 0;
  maiorFrequencia: number = 0;
  menorFrequencia: number = 0;
  melhorAluno: string = '';

  selectedView: 'bars' | 'columns' | 'ranking' = 'bars';

  ngOnInit(): void {
    this.calcularMetricas();
  }

  calcularMetricas(): void {
    this.totalAlunos = this.dadosPresenca.length;
    if (this.totalAlunos > 0) {
      const soma = this.dadosPresenca.reduce((acc, item) => acc + item.percentual, 0);
      this.mediaFrequencia = Math.round(soma / this.totalAlunos);
      
      const ordenados = [...this.dadosPresenca].sort((a, b) => b.percentual - a.percentual);
      this.maiorFrequencia = ordenados[0].percentual;
      this.melhorAluno = ordenados[0].nome;
      this.menorFrequencia = ordenados[ordenados.length - 1].percentual;
    }
  }

  getStatusClass(percentual: number): string {
    if (percentual >= 75) return 'status-high';
    if (percentual >= 50) return 'status-medium';
    return 'status-low';
  }

  getStatusLabel(percentual: number): string {
    if (percentual >= 75) return 'Excelente';
    if (percentual >= 50) return 'Regular';
    return 'Atenção';
  }

  getStrokeOffset(percentual: number): number {
    const circumference = 226.19; // 2 * PI * 36
    return circumference - (percentual / 100) * circumference;
  }
}
