import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../environments/environment';
import { Aluno } from '../models/aluno.model';
import { Aula, AulaPayload } from '../models/aula.model';
import { Ciclo, CicloPayload } from '../models/ciclo.model';
import {
  Matricula,
  CadastroMatriculaPayload,
  AtualizarMatriculaPayload
} from '../models/matricula.model';
import {
  Pagamento,
  CadastroPagamentoPayload,
  EditarPagamentoPayload
} from '../models/pagamento.model';
import { Presenca } from '../models/presenca.model';
import { ProgramaAula, ProgramaAulaPayload } from '../models/programa-aula.model';
import { TipoAula } from '../models/tipo-aula.model';
import {
  Evento,
  EventoPayload,
  ParticipanteEvento,
  ParticipantePayload,
  ReceitaEvento,
  ReceitaPayload,
  DespesaEvento,
  DespesaPayload
} from '../models/evento.model';

export { API_URL };

@Injectable({
  providedIn: 'root'
})
export class GerenciadorAulasService {

  constructor(private http: HttpClient) { }

  // Ciclos
  getCiclos(): Observable<Ciclo[]> {
    return this.http.get<Ciclo[]>(`${API_URL}/ciclos`);
  }

  getCicloPorId(id: number): Observable<Ciclo> {
    return this.http.get<Ciclo>(`${API_URL}/ciclos/${id}`);
  }

  criarCiclo(ciclo: CicloPayload): Observable<Ciclo> {
    return this.http.post<Ciclo>(`${API_URL}/ciclos`, ciclo);
  }

  atualizarCiclo(id: number, ciclo: CicloPayload): Observable<Ciclo> {
    return this.http.put<Ciclo>(`${API_URL}/ciclos/${id}`, ciclo);
  }

  deletarCiclo(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/ciclos/${id}`);
  }

  // Programas de Aulas
  getProgramaAulas(cicloId?: number): Observable<ProgramaAula[]> {
    return this.http.get<ProgramaAula[]>(`${API_URL}/programa-aulas/ciclo/${cicloId}`);
  }

  getTipoAulas(): Observable<TipoAula[]> {
    return this.http.get<TipoAula[]>(`${API_URL}/tipo-aulas`);
  }

  criarProgramaAula(programa: ProgramaAulaPayload): Observable<ProgramaAula> {
    return this.http.post<ProgramaAula>(`${API_URL}/programa-aulas`, programa);
  }

  atualizarProgramaAula(id: number, programa: ProgramaAulaPayload): Observable<ProgramaAula> {
    return this.http.put<ProgramaAula>(`${API_URL}/programa-aulas/${id}`, programa);
  }

  deletarProgramaAula(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/programa-aulas/${id}`);
  }

  // Aulas
  getAulas(programaId?: number): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${API_URL}/aulas/programaAula/${programaId}`);
  }

  getAulaPorId(id: number): Observable<Aula> {
    return this.http.get<Aula>(`${API_URL}/aulas/${id}`);
  }

  criarAula(aula: AulaPayload): Observable<Aula> {
    return this.http.post<Aula>(`${API_URL}/aulas`, aula);
  }

  atualizarAula(id: number, aula: AulaPayload): Observable<Aula> {
    return this.http.put<Aula>(`${API_URL}/aulas/${id}`, aula);
  }

  deletarAula(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/aulas/${id}`);
  }

  // Presenças
  getPresencasPorAula(aulaId: number): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(`${API_URL}/matriculas/aula/${aulaId}`);
  }

  registrarPresenca(aulaId: number, matriculaId: number): Observable<Presenca> {
    const payload = {
      matriculaId: matriculaId,
      aulaId: aulaId
    };
    return this.http.post<Presenca>(`${API_URL}/presencas`, payload);
  }

  removerPresenca(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/presencas/${id}`);
  }

  // Alunos
  getAlunos(): Observable<Aluno[]> {
    return this.http.get<Aluno[]>(`${API_URL}/alunos`);
  }

  getAlunoPorId(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${API_URL}/alunos/${id}`);
  }

  criarAluno(aluno: { nome: string }): Observable<Aluno> {
    return this.http.post<Aluno>(`${API_URL}/alunos`, aluno);
  }

  atualizarAluno(id: number, aluno: { nome: string }): Observable<Aluno> {
    return this.http.put<Aluno>(`${API_URL}/alunos/${id}`, aluno);
  }

  // Matrículas
  getMatriculas(alunoId: number): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(`${API_URL}/matriculas/aluno/${alunoId}`);
  }

  criarMatricula(matricula: CadastroMatriculaPayload): Observable<Matricula> {
    return this.http.post<Matricula>(`${API_URL}/matriculas`, matricula);
  }

  atualizarMatricula(id: number, matricula: AtualizarMatriculaPayload): Observable<Matricula> {
    return this.http.put<Matricula>(`${API_URL}/matriculas/${id}`, matricula);
  }

  atualizarStatusMatricula(id: number, ativo: boolean): Observable<void> {
    return this.http.put<void>(`${API_URL}/matriculas/${id}/status?ativo=${ativo}`, { ativo });
  }

  deletarMatricula(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/matriculas/${id}`);
  }

  // Pagamentos
  getPagamentos(alunoId: number): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${API_URL}/pagamentos/aluno/${alunoId}`);
  }

  getTodosPagamentos(params?: { inicio?: string, fim?: string, alunoId?: number, cicloId?: number }): Observable<Pagamento[]> {
    let query = '';
    if (params) {
      const q: string[] = [];
      if (params.inicio) q.push(`inicio=${encodeURIComponent(params.inicio)}`);
      if (params.fim) q.push(`fim=${encodeURIComponent(params.fim)}`);
      if (params.alunoId) q.push(`alunoId=${params.alunoId}`);
      if (params.cicloId) q.push(`cicloId=${params.cicloId}`);
      if (q.length > 0) query = '?' + q.join('&');
    }
    return this.http.get<Pagamento[]>(`${API_URL}/pagamentos${query}`);
  }

  criarPagamento(pagamento: CadastroPagamentoPayload): Observable<Pagamento> {
    return this.http.post<Pagamento>(`${API_URL}/pagamentos`, pagamento);
  }

  atualizarPagamento(id: number, pagamento: EditarPagamentoPayload): Observable<Pagamento> {
    return this.http.put<Pagamento>(`${API_URL}/pagamentos/${id}`, pagamento);
  }

  deletarPagamento(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/pagamentos/${id}`);
  }

  // Eventos e Viagens
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${API_URL}/api/eventos`);
  }

  criarEvento(evento: EventoPayload): Observable<Evento> {
    return this.http.post<Evento>(`${API_URL}/api/eventos`, evento);
  }

  atualizarEvento(id: number, evento: EventoPayload): Observable<Evento> {
    return this.http.put<Evento>(`${API_URL}/api/eventos/${id}`, evento);
  }

  deletarEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/api/eventos/${id}`);
  }

  criarParticipante(participante: ParticipantePayload): Observable<ParticipanteEvento> {
    return this.http.post<ParticipanteEvento>(`${API_URL}/api/participantes`, participante);
  }

  deletarParticipante(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/api/participantes/${id}`);
  }

  criarReceita(receita: ReceitaPayload): Observable<ReceitaEvento> {
    return this.http.post<ReceitaEvento>(`${API_URL}/api/receitas`, receita);
  }

  deletarReceita(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/api/receitas/${id}`);
  }

  criarDespesa(despesa: DespesaPayload): Observable<DespesaEvento> {
    return this.http.post<DespesaEvento>(`${API_URL}/api/despesas`, despesa);
  }

  deletarDespesa(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/api/despesas/${id}`);
  }
}
