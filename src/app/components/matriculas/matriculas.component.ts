import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';

@Component({
  selector: 'app-matriculas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './matriculas.component.html',
  styleUrl: './matriculas.component.css'
})
export class MatriculasComponent implements OnInit {
  matriculas: any[] = [];
  alunoId!: number;

  constructor(
    private service: GerenciadorAulasService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('alunoId');
      if (id) {
        this.alunoId = +id;
        this.loadMatriculas();
      }
    });
  }

  loadMatriculas() {
    this.service.getMatriculas(this.alunoId).subscribe(data => {
      this.matriculas = data;
    });
  }
}
