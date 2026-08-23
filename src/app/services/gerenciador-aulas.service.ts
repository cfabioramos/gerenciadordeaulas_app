import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../environments/environment';
import { Matricula } from '../components/presenca/presenca.component';

export { API_URL };

@Injectable({
  providedIn: 'root'
})
export class GerenciadorAulasService {

  constructor(private http: HttpClient) { }

  getCiclos(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/ciclos`);
  }

  getCicloPorId(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/ciclos/${id}`);
  }

  getProgramaAulas(cicloId?: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/programa-aulas/ciclo/${cicloId}`);
  }

  getAulas(programaId?: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/aulas/programaAula/${programaId}`);
  }

  getPresencasPorAula(aulaId: number): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(`${API_URL}/matriculas/aula/${aulaId}`);
  }

  registrarPresenca(aulaId: number, matriculaId: number): Observable<any> {
    const payload = {
      matriculaId: matriculaId,
      aulaId: aulaId
    };
    return this.http.post<any>(`${API_URL}/presencas`, payload);
  }

  removerPresenca(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/presencas/${id}`);
  }

  getAlunos(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/alunos`);
  }

  criarAluno(aluno: { nome: string }): Observable<any> {
    return this.http.post<any>(`${API_URL}/alunos`, aluno);
  }

  getMatriculas(alunoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/matriculas/aluno/${alunoId}`);
  }

  criarMatricula(matricula: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/matriculas`, matricula);
  }

  deletarMatricula(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/matriculas/${id}`);
  }
}
