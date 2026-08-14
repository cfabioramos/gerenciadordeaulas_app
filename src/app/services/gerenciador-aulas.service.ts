import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_URL = 'https://gerenciadordeaulas-1.onrender.com';

@Injectable({
  providedIn: 'root'
})
export class GerenciadorAulasService {

  constructor(private http: HttpClient) { }

  getCiclos(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/ciclos`);
  }

  getProgramaAulas(cicloId?: number): Observable<any[]> {
    // If we want to filter by cicloId we can pass it, or just use the global one as requested:
    // User plan said: GET /programa-aulas
    // We can also use /programa-aulas/ciclo/:id if the API supports it, but plan says /programa-aulas
    return this.http.get<any[]>(`${API_URL}/programa-aulas`);
  }

  getAulas(programaId?: number): Observable<any[]> {
    // Similarly, plan says: GET /aulas
    return this.http.get<any[]>(`${API_URL}/aulas`);
  }

  getPresencasPorAula(aulaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/alunos/aula/${aulaId}`);
  }

  registrarPresenca(aulaId: number, matriculaId: number): Observable<any> {
    const payload = {
      aula: { id: aulaId },
      matricula: { id: matriculaId }
    };
    return this.http.post<any>(`${API_URL}/presencas`, payload);
  }

  removerPresenca(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/presencas/${id}`);
  }

  getAlunos(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/alunos`);
  }

  getMatriculas(alunoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/matriculas/aluno/${alunoId}`);
  }
}
