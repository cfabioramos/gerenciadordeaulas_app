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

  getAlunoPorId(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/alunos/${id}`);
  }

  criarAluno(aluno: { nome: string }): Observable<any> {
    return this.http.post<any>(`${API_URL}/alunos`, aluno);
  }

  atualizarAluno(id: number, aluno: { nome: string }): Observable<any> {
    return this.http.put<any>(`${API_URL}/alunos/${id}`, aluno);
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

  atualizarMatricula(id: number, matricula: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/matriculas/${id}`, matricula);
  }

  atualizarStatusMatricula(id: number, ativo: boolean): Observable<any> {
    return this.http.put<any>(`${API_URL}/matriculas/${id}/status?ativo=${ativo}`, { ativo });
  }

  getPagamentos(alunoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/pagamentos/aluno/${alunoId}`);
  }

  getTodosPagamentos(params?: { inicio?: string, fim?: string, alunoId?: number, cicloId?: number }): Observable<any[]> {
    let query = '';
    if (params) {
      const q: string[] = [];
      if (params.inicio) q.push(`inicio=${encodeURIComponent(params.inicio)}`);
      if (params.fim) q.push(`fim=${encodeURIComponent(params.fim)}`);
      if (params.alunoId) q.push(`alunoId=${params.alunoId}`);
      if (params.cicloId) q.push(`cicloId=${params.cicloId}`);
      if (q.length > 0) query = '?' + q.join('&');
    }
    return this.http.get<any[]>(`${API_URL}/pagamentos${query}`);
  }

  criarPagamento(pagamento: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/pagamentos`, pagamento);
  }

  atualizarPagamento(id: number, pagamento: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/pagamentos/${id}`, pagamento);
  }

  deletarPagamento(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/pagamentos/${id}`);
  }

  // Ciclos CRUD
  criarCiclo(ciclo: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/ciclos`, ciclo);
  }

  atualizarCiclo(id: number, ciclo: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/ciclos/${id}`, ciclo);
  }

  deletarCiclo(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/ciclos/${id}`);
  }

  // Programas de Aulas CRUD
  getTipoAulas(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/tipo-aulas`);
  }

  criarProgramaAula(programa: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/programa-aulas`, programa);
  }

  atualizarProgramaAula(id: number, programa: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/programa-aulas/${id}`, programa);
  }

  deletarProgramaAula(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/programa-aulas/${id}`);
  }

  // Aulas CRUD
  criarAula(aula: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/aulas`, aula);
  }

  atualizarAula(id: number, aula: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/aulas/${id}`, aula);
  }

  deletarAula(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/aulas/${id}`);
  }

  getAulaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/aulas/${id}`);
  }
}
