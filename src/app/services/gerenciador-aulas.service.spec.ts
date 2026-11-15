import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_URL, GerenciadorAulasService } from './gerenciador-aulas.service';

describe('GerenciadorAulasService', () => {
  let service: GerenciadorAulasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GerenciadorAulasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Ciclos
  it('getCiclos faz GET em /ciclos', () => {
    service.getCiclos().subscribe();
    const req = httpMock.expectOne(`${API_URL}/ciclos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('criarCiclo faz POST com payload', () => {
    const payload = { nome: 'C' } as any;
    service.criarCiclo(payload).subscribe();
    const req = httpMock.expectOne(`${API_URL}/ciclos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('atualizarCiclo faz PUT em /ciclos/:id', () => {
    service.atualizarCiclo(5, { nome: 'X' } as any).subscribe();
    const req = httpMock.expectOne(`${API_URL}/ciclos/5`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('deletarCiclo faz DELETE em /ciclos/:id', () => {
    service.deletarCiclo(5).subscribe();
    const req = httpMock.expectOne(`${API_URL}/ciclos/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Eventos e Viagens
  it('getEventos faz GET em /api/eventos', () => {
    service.getEventos().subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/eventos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('criarEvento faz POST em /api/eventos com payload', () => {
    const payload = { titulo: 'T', descricao: 'D', tipo: 'EVENTO' } as any;
    service.criarEvento(payload).subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/eventos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('atualizarEvento faz PUT em /api/eventos/:id', () => {
    service.atualizarEvento(7, { titulo: 'X' } as any).subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/eventos/7`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('deletarEvento faz DELETE em /api/eventos/:id', () => {
    service.deletarEvento(7).subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/eventos/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('criarParticipante faz POST em /api/participantes', () => {
    const payload = { nome: 'Ana', eventoId: 1 } as any;
    service.criarParticipante(payload).subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/participantes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('deletarParticipante faz DELETE em /api/participantes/:id', () => {
    service.deletarParticipante(3).subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/participantes/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('criarReceita faz POST em /api/receitas', () => {
    const payload = { valor: 10, eventoId: 1 } as any;
    service.criarReceita(payload).subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/receitas`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('deletarReceita faz DELETE em /api/receitas/:id', () => {
    service.deletarReceita(4).subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/receitas/4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('criarDespesa faz POST em /api/despesas', () => {
    const payload = { valor: 5, eventoId: 1 } as any;
    service.criarDespesa(payload).subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/despesas`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('deletarDespesa faz DELETE em /api/despesas/:id', () => {
    service.deletarDespesa(9).subscribe();
    const req = httpMock.expectOne(`${API_URL}/api/despesas/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Pagamentos query params
  it('getTodosPagamentos monta query string', () => {
    service.getTodosPagamentos({ inicio: '2026-01-01', alunoId: 3 }).subscribe();
    const req = httpMock.expectOne(`${API_URL}/pagamentos?inicio=2026-01-01&alunoId=3`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // Alunos
  it('getAlunos faz GET em /alunos', () => {
    service.getAlunos().subscribe();
    const req = httpMock.expectOne(`${API_URL}/alunos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('criarAluno faz POST em /alunos', () => {
    service.criarAluno({ nome: 'Ana' }).subscribe();
    const req = httpMock.expectOne(`${API_URL}/alunos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nome: 'Ana' });
    req.flush({});
  });
});
