import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosViagensComponent } from './eventos-viagens.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('EventosViagensComponent', () => {
  let component: EventosViagensComponent;
  let fixture: ComponentFixture<EventosViagensComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [EventosViagensComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(EventosViagensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar na aba de eventos', () => {
    expect(component.tipo).toBe('EVENTO');
  });

  it('deve iniciar sem itens', () => {
    expect(component.itens).toEqual([]);
  });

  it('deve filtrar itens por termo de busca', () => {
    component.itens = [
      { id: 1, tipo: 'EVENTO', titulo: 'Workshop de Forró', descricao: 'Oficina', dias: [] } as any,
      { id: 2, tipo: 'EVENTO', titulo: 'Encontro', descricao: 'Circular', dias: [] } as any,
    ];
    component.searchTerm = 'forró';
    expect(component.itensFiltrados.length).toBe(1);
  });

  it('tipoLabel deve refletir o tipo selecionado', () => {
    component.tipo = 'EVENTO';
    expect(component.tipoLabel).toBe('Eventos');
    component.tipo = 'VIAGEM';
    expect(component.tipoLabel).toBe('Viagens');
  });

  it('tipoLabelBadge deve retornar rótulo correto', () => {
    expect(component.tipoLabelBadge('EVENTO')).toBe('Evento');
    expect(component.tipoLabelBadge('VIAGEM')).toBe('Viagem');
  });

  it('itensFiltrados deve filtrar por tipo', () => {
    component.tipo = 'VIAGEM';
    component.itens = [
      { id: 1, tipo: 'EVENTO', titulo: 'E', descricao: '', dias: [] } as any,
      { id: 2, tipo: 'VIAGEM', titulo: 'V', descricao: '', dias: [] } as any,
    ];
    expect(component.itensFiltrados.length).toBe(1);
    expect(component.itensFiltrados[0].id).toBe(2);
  });

  it('ehAlunoNome deve identificar aluno cadastrado', () => {
    component.alunos = [{ id: 1, nome: 'Ana' } as any];
    expect(component.ehAlunoNome('Ana')).toBeTrue();
    expect(component.ehAlunoNome('Zé')).toBeFalse();
    expect(component.ehAlunoNome(undefined)).toBeFalse();
  });

  it('getNomeAluno e getNomeParticipante devem resolver nomes', () => {
    component.alunos = [{ id: 1, nome: 'Ana' } as any];
    expect(component.getNomeAluno(1)).toBe('Ana');
    expect(component.getNomeAluno(999)).toBe('');
    expect(component.getNomeParticipante(999)).toBe('');
  });

  it('getDescricaoReferenciaReceita deve descrever referência', () => {
    component.alunos = [{ id: 1, nome: 'Ana' } as any];
    expect(component.getDescricaoReferenciaReceita({ participante: { id: 7, nome: 'Ana' } } as any)).toContain('Aluno');
    expect(component.getDescricaoReferenciaReceita({ participante: { id: 7, nome: 'Bia' } } as any)).toContain('Participante');
    expect(component.getDescricaoReferenciaReceita({} as any)).toBe('—');
  });

  it('formatarDataBR e formatarMoeda devem formatar', () => {
    expect(component.formatarDataBR('2026-09-10')).toContain('2026');
    expect(component.formatarDataBR(undefined)).toBe('');
    expect(component.formatarMoeda(12.5)).toContain('12');
    expect(component.formatarMoeda(undefined)).toContain('0');
  });

  it('totalReceitas/totalDespesas/saldo devem calcular', () => {
    component.selectedItemForDetails = {
      id: 1,
      receitas: [{ id: 1, valor: 100 }, { id: 2, valor: 50 }],
      despesas: [{ id: 1, valor: 30 }],
    } as any;
    expect(component.totalReceitas).toBe(150);
    expect(component.totalDespesas).toBe(30);
    expect(component.saldo).toBe(120);
  });

  it('participantesNaoAlunos deve excluir alunos cadastrados', () => {
    component.alunos = [{ id: 1, nome: 'Ana' } as any];
    component.selectedItemForDetails = {
      id: 9,
      participantes: [
        { id: 1, nome: 'Ana', eventoId: 9 },
        { id: 2, nome: 'Bia', eventoId: 9 },
      ],
    } as any;
    const naoAlunos = component.participantesNaoAlunos;
    expect(naoAlunos.length).toBe(1);
    expect(naoAlunos[0].nome).toBe('Bia');
  });

  it('selecionarTipo deve alterar o tipo', () => {
    component.selecionarTipo('VIAGEM');
    expect(component.tipo).toBe('VIAGEM');
  });

  it('novoItem deve abrir modal e limpar formulário', () => {
    component.novoItem();
    expect(component.showModal).toBeTrue();
    expect(component.editingItem).toBeNull();
  });

  it('limparFormulario deve resetar campos', () => {
    component.formTitulo = 'X';
    component.formDescricao = 'Y';
    component.limparFormulario();
    expect(component.formTitulo).toBe('');
    expect(component.formDescricao).toBe('');
  });

  it('adicionarDataEvento e removerDataEvento devem gerenciar datas', () => {
    component.limparFormulario();
    component.adicionarDataEvento();
    expect(component.formDatas.length).toBe(1);
    component.removerDataEvento(0);
    expect(component.formDatas.length).toBe(0);
  });
});
