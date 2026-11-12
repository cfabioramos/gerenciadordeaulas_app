import {Component, HostListener, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

interface EventoItem {
  id: number;
  tipo: 'EVENTO' | 'VIAGEM';
  titulo: string;
  descricao: string;
  local?: string;
  status: string;
  // Para Evento: array de datas com horários
  datas?: Array<{ data: string; horario: string }>;
  // Para Viagem: saída e retorno
  dataSaida?: string;
  horarioSaida?: string;
  dataRetorno?: string;
  horarioRetorno?: string;
  participantes: Array<{ id: number; nome: string; tipo: 'ALUNO' | 'PARTICIPANTE' }>;
  receitas: Array<{ id: number; descricao: string; valor: number; tipo: 'ALUNO' | 'PARTICIPANTE'; nomeReferencia: string }>;
  despesas: Array<{ id: number; descricao: string; valor: number }>;
  createdAt: string;
}

interface AlunoMock {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-eventos-viagens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eventos-viagens.component.html',
  styleUrl: './eventos-viagens.component.css'
})
export class EventosViagensComponent implements OnInit {

  // Estados da tela
  tipo: 'EVENTO' | 'VIAGEM' | null = null;
  showModal = false;
  showParticipantesModal = false;
  showFinanceiroModal = false;
  editingItem: EventoItem | null = null;
  selectedItemForDetails: EventoItem | null = null;
  searchTerm = '';
  modalLoading = false;
  isAdmin = true;
  selectedAlunosTemp: number | null = null;

  // Dados mockados - Alunos cadastrados
  alunos: AlunoMock[] = [
    { id: 1, nome: 'Carlos Fábio Ramos' },
    { id: 2, nome: 'Marcos Afonso' },
    { id: 3, nome: 'Ana Paula Silva' },
    { id: 4, nome: 'Roberto Carlos Souza' },
    { id: 5, nome: 'Fernanda Lima' }
  ];

  // Dados mockados - Participantes criados
  participantesCriados: Array<{ id: number; nome: string }> = [
    { id: 101, nome: 'João Participante' },
    { id: 102, nome: 'Maria Visitante' }
  ];

  // Dados mockados - Eventos e Viagens
  itens: EventoItem[] = [
    {
      id: 1,
      tipo: 'EVENTO',
      titulo: 'Workshop de Forró 2026',
      descricao: 'Oficina intensiva de passos básicos e intermediários de forró',
      local: 'Salão de Dança Ziriguidum',
      status: 'AGENDADO',
      datas: [
        { data: '10/09/2026', horario: '19:00' },
        { data: '17/09/2026', horario: '19:00' },
        { data: '24/09/2026', horario: '19:00' },
        { data: '01/10/2026', horario: '19:00' }
      ],
      participantes: [
        { id: 1, nome: 'Carlos Fábio Ramos', tipo: 'ALUNO' },
        { id: 101, nome: 'João Participante', tipo: 'PARTICIPANTE' }
      ],
      receitas: [
        { id: 1, descricao: 'Inscrição workshop', valor: 150.00, tipo: 'ALUNO', nomeReferencia: 'Carlos Fábio Ramos' },
        { id: 2, descricao: 'Inscrição workshop', valor: 100.00, tipo: 'PARTICIPANTE', nomeReferencia: 'João Participante' }
      ],
      despesas: [
        { id: 1, descricao: 'Aluguel do salão', valor: 200.00 },
        { id: 2, descricao: 'Coffee break', valor: 80.00 }
      ],
      createdAt: '01/09/2026'
    },
    {
      id: 2,
      tipo: 'VIAGEM',
      titulo: 'Viagem Cultural - Salvador',
      descricao: 'Viagem de estudos sobre cultura popular baiana',
      local: 'Salvador, BA',
      status: 'CONFIRMADO',
      dataSaida: '15/10/2026',
      horarioSaida: '08:00',
      dataRetorno: '20/10/2026',
      horarioRetorno: '22:00',
      participantes: [
        { id: 2, nome: 'Marcos Afonso', tipo: 'ALUNO' },
        { id: 3, nome: 'Ana Paula Silva', tipo: 'ALUNO' }
      ],
      receitas: [
        { id: 3, descricao: 'Pacote viagem', valor: 1200.00, tipo: 'ALUNO', nomeReferencia: 'Marcos Afonso' },
        { id: 4, descricao: 'Pacote viagem', valor: 1200.00, tipo: 'ALUNO', nomeReferencia: 'Ana Paula Silva' }
      ],
      despesas: [
        { id: 3, descricao: 'Passagem aérea', valor: 800.00 },
        { id: 4, descricao: 'Hospedagem', valor: 600.00 },
        { id: 5, descricao: 'Transporte local', valor: 150.00 }
      ],
      createdAt: '20/08/2026'
    },
    {
      id: 3,
      tipo: 'EVENTO',
      titulo: 'Encontro de Dança Circular',
      descricao: 'Rodas de dança circular com músicas regionais',
      local: 'Centro Cultural',
      status: 'CANCELADO',
      datas: [
        { data: '05/10/2026', horario: '14:00' }
      ],
      participantes: [],
      receitas: [],
      despesas: [],
      createdAt: '15/08/2026'
    }
  ];

  // Estado do formulário de cadastro/edição
  formTipo: 'EVENTO' | 'VIAGEM' = 'EVENTO';
  formTitulo = '';
  formDescricao = '';
  formLocal = '';
  formStatus = 'AGENDADO';

  // Para Evento: array de datas/horários
  formDatas: Array<{ data: string; horario: string }> = [];

  // Para Viagem: saída e retorno
  formDataSaida = '';
  formHorarioSaida = '';
  formDataRetorno = '';
  formHorarioRetorno = '';

  // Participantes selecionados
  selectedAlunos: number[] = [];
  selectedParticipantes: number[] = [];
  novoParticipanteNome = '';

  // Financeiro
  modalTipo: 'RECEITA' | 'DESPESA' = 'RECEITA';
  formDescricaoFinanceiro = '';
  formValorFinanceiro = 0;
  formTipoReferencia: 'ALUNO' | 'PARTICIPANTE' = 'ALUNO';
  formReferenciaId: number | null = null;

  ngOnInit(): void {
    // Dados já carregados estaticamente
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(_event: KeyboardEvent): void {
    if (this.showModal) {
      this.showModal = false;
    }
    if (this.showParticipantesModal) {
      this.showParticipantesModal = false;
    }
    if (this.showFinanceiroModal) {
      this.showFinanceiroModal = false;
    }
  }

  get tipoLabel(): string {
    return this.tipo === 'VIAGEM' ? 'Viagens' : 'Eventos';
  }

  get itensFiltrados(): EventoItem[] {
    const lista = this.itens.filter(i => i.tipo === this.tipo);
    if (!this.searchTerm) return lista;
    const term = this.searchTerm.toLowerCase();
    return lista.filter(i =>
      i.titulo.toLowerCase().includes(term) ||
      (i.descricao || '').toLowerCase().includes(term)
    );
  }

  applyFilter(): void {
    // Filter is computed reactively via itensFiltrados
  }

  get totalReceitas(): number {
    if (!this.selectedItemForDetails) return 0;
    return this.selectedItemForDetails.receitas.reduce((acc, r) => acc + r.valor, 0);
  }

  get totalDespesas(): number {
    if (!this.selectedItemForDetails) return 0;
    return this.selectedItemForDetails.despesas.reduce((acc, d) => acc + d.valor, 0);
  }

  get saldo(): number {
    return this.totalReceitas - this.totalDespesas;
  }

  // --- Navegação de tipo ---
  selecionarTipo(t: 'EVENTO' | 'VIAGEM'): void {
    this.tipo = t;
  }

  // --- Ações da lista ---
  novoItem(): void {
    this.editingItem = null;
    this.formTipo = this.tipo || 'EVENTO';
    this.limparFormulario();
    this.showModal = true;
  }

  editarItem(item: EventoItem): void {
    this.editingItem = item;
    this.formTipo = item.tipo;
    this.formTitulo = item.titulo;
    this.formDescricao = item.descricao || '';
    this.formLocal = item.local || '';
    this.formStatus = item.status;
    this.selectedAlunos = item.participantes.filter(p => p.tipo === 'ALUNO').map(p => p.id);
    this.selectedParticipantes = item.participantes.filter(p => p.tipo === 'PARTICIPANTE').map(p => p.id);

    if (item.tipo === 'EVENTO' && item.datas) {
      this.formDatas = [...item.datas];
    } else if (item.tipo === 'VIAGEM') {
      this.formDataSaida = item.dataSaida || '';
      this.formHorarioSaida = item.horarioSaida || '';
      this.formDataRetorno = item.dataRetorno || '';
      this.formHorarioRetorno = item.horarioRetorno || '';
    }

    this.showModal = true;
  }

  excluirItem(item: EventoItem): void {
    if (confirm(`Tem certeza que deseja excluir "${item.titulo}"?`)) {
      this.itens = this.itens.filter(i => i.id !== item.id);
    }
  }

  limparFormulario(): void {
    this.formTitulo = '';
    this.formDescricao = '';
    this.formLocal = '';
    this.formStatus = 'AGENDADO';
    this.formDatas = [];
    this.formDataSaida = '';
    this.formHorarioSaida = '';
    this.formDataRetorno = '';
    this.formHorarioRetorno = '';
    this.selectedAlunos = [];
    this.selectedParticipantes = [];
    this.novoParticipanteNome = '';
  }

  adicionarDataEvento(): void {
    this.formDatas.push({ data: '', horario: '' });
  }

  removerDataEvento(index: number): void {
    this.formDatas.splice(index, 1);
  }

  // --- Salvar formulário ---
  onSubmit(): void {
    if (!this.formTitulo || !this.formDescricao) {
      alert('Título e Descrição são obrigatórios.');
      return;
    }

    if (this.formTipo === 'EVENTO') {
      if (!this.formDatas || this.formDatas.length === 0) {
        alert('Informe pelo menos uma data e horário para o Evento.');
        return;
      }
      // Validar datas/horários preenchidos
      for (const d of this.formDatas) {
        if (!d.data || !d.horario) {
          alert('Preencha todas as datas e horários do Evento.');
          return;
        }
      }
    } else {
      if (!this.formDataSaida || !this.formHorarioSaida || !this.formDataRetorno || !this.formHorarioRetorno) {
        alert('Data/Hora de saída e retorno são obrigatórios para Viagem.');
        return;
      }
    }

    const novoItem: EventoItem = {
      id: this.editingItem ? this.editingItem.id : Date.now(),
      tipo: this.formTipo,
      titulo: this.formTitulo,
      descricao: this.formDescricao,
      local: this.formLocal,
      status: this.formStatus,
      participantes: [
        ...this.selectedAlunos.map(id => ({ id, nome: this.alunos.find(a => a.id === id)!.nome, tipo: 'ALUNO' as const })),
        ...this.selectedParticipantes.map(id => ({ id, nome: this.participantesCriados.find(p => p.id === id)!.nome, tipo: 'PARTICIPANTE' as const }))
      ],
      receitas: this.editingItem ? [...this.editingItem.receitas] : [],
      despesas: this.editingItem ? [...this.editingItem.despesas] : [],
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    if (this.formTipo === 'EVENTO') {
      novoItem.datas = [...this.formDatas];
    } else {
      novoItem.dataSaida = this.formDataSaida;
      novoItem.horarioSaida = this.formHorarioSaida;
      novoItem.dataRetorno = this.formDataRetorno;
      novoItem.horarioRetorno = this.formHorarioRetorno;
    }

    if (this.editingItem) {
      const idx = this.itens.findIndex(i => i.id === this.editingItem!.id);
      if (idx >= 0) this.itens[idx] = novoItem;
    } else {
      this.itens.push(novoItem);
    }

    this.showModal = false;
    this.editingItem = null;
    this.limparFormulario();
  }

  // --- Participantes Modal ---
  abrirParticipantes(item: EventoItem): void {
    this.selectedItemForDetails = item;
    this.selectedAlunos = item.participantes.filter(p => p.tipo === 'ALUNO').map(p => p.id);
    this.selectedParticipantes = item.participantes.filter(p => p.tipo === 'PARTICIPANTE').map(p => p.id);
    this.novoParticipanteNome = '';
    this.showParticipantesModal = true;
  }

  adicionarParticipante(): void {
    if (!this.novoParticipanteNome.trim()) {
      alert('Informe o nome do participante.');
      return;
    }
    const novo = { id: Date.now(), nome: this.novoParticipanteNome.trim() };
    this.participantesCriados.push(novo);
    this.selectedParticipantes.push(novo.id);
    this.novoParticipanteNome = '';
  }

  removerParticipanteSelecionado(id: number, tipo: 'ALUNO' | 'PARTICIPANTE'): void {
    if (tipo === 'ALUNO') {
      this.selectedAlunos = this.selectedAlunos.filter(x => x !== id);
    } else {
      this.selectedParticipantes = this.selectedParticipantes.filter(x => x !== id);
    }
  }

  salvarParticipantes(): void {
    if (!this.selectedItemForDetails) return;
    this.selectedItemForDetails.participantes = [
      ...this.selectedAlunos.map(id => ({id, nome: this.alunos.find(a => a.id === id)!.nome, tipo: 'ALUNO' as const})),
      ...this.selectedParticipantes.map(id => ({
        id,
        nome: this.participantesCriados.find(p => p.id === id)!.nome,
        tipo: 'PARTICIPANTE' as const
      }))
    ];
    this.showParticipantesModal = false;
    this.selectedItemForDetails = null;
  }

  abrirDetalhesFinanceiros(item: EventoItem): void {
    this.abrirFinanceiro(item, 'RECEITA');
  }

  // --- Financeiro Modal ---
  abrirFinanceiro(item: EventoItem, modalTipo: 'RECEITA' | 'DESPESA'): void {
    this.selectedItemForDetails = item;
    this.modalTipo = modalTipo;
    this.formDescricaoFinanceiro = '';
    this.formValorFinanceiro = 0;
    this.formTipoReferencia = 'ALUNO';
    this.formReferenciaId = null;
    this.showFinanceiroModal = true;
  }

  salvarFinanceiro(): void {
    if (!this.selectedItemForDetails) return;
    if (!this.formDescricaoFinanceiro || this.formValorFinanceiro <= 0) {
      alert('Descrição e valor são obrigatórios.');
      return;
    }

    const novoId = Date.now();
    if (this.modalTipo === 'RECEITA') {
      const ref = this.formTipoReferencia === 'ALUNO'
        ? this.alunos.find(a => a.id === this.formReferenciaId)!
        : this.participantesCriados.find(p => p.id === this.formReferenciaId)!;
      this.selectedItemForDetails.receitas.push({
        id: novoId,
        descricao: this.formDescricaoFinanceiro,
        valor: this.formValorFinanceiro,
        tipo: this.formTipoReferencia,
        nomeReferencia: ref.nome
      });
    } else {
      this.selectedItemForDetails.despesas.push({
        id: novoId,
        descricao: this.formDescricaoFinanceiro,
        valor: this.formValorFinanceiro
      });
    }

    this.showFinanceiroModal = false;
    this.selectedItemForDetails = null;
  }

  removerReceita(id: number): void {
    if (!this.selectedItemForDetails) return;
    this.selectedItemForDetails.receitas = this.selectedItemForDetails.receitas.filter(r => r.id !== id);
  }

  removerDespesa(id: number): void {
    if (!this.selectedItemForDetails) return;
    this.selectedItemForDetails.despesas = this.selectedItemForDetails.despesas.filter(d => d.id !== id);
  }

  // --- Helpers de template ---
  formatarDataBR(dataStr: string | undefined): string {
    if (!dataStr) return '';
    if (dataStr.includes('/')) return dataStr;
    const parts = dataStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dataStr;
  }

  tipoLabelBadge(tipo: 'EVENTO' | 'VIAGEM'): string {
    return tipo === 'EVENTO' ? 'Evento' : 'Viagem';
  }

  formatarMoeda(valor: number | undefined): string {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  getDescricaoReferencia(tipo: 'ALUNO' | 'PARTICIPANTE', nome: string): string {
    return `${tipo === 'ALUNO' ? 'Aluno' : 'Participante'}: ${nome}`;
  }

  getNomeAluno(id: number): string {
    const a = this.alunos.find(x => x.id === id);
    return a ? a.nome : '';
  }

  getNomeParticipante(id: number): string {
    const p = this.participantesCriados.find(x => x.id === id);
    return p ? p.nome : '';
  }

  toggleParticipante(id: number): void {
    if (this.selectedParticipantes.includes(id)) {
      this.selectedParticipantes = this.selectedParticipantes.filter(x => x !== id);
    } else {
      this.selectedParticipantes.push(id);
    }
  }

  adicionarAlunoTemp(): void {
    if (!this.selectedAlunosTemp) return;
    if (!this.selectedAlunos.includes(this.selectedAlunosTemp)) {
      this.selectedAlunos.push(this.selectedAlunosTemp);
    }
    this.selectedAlunosTemp = null;
  }

  adicionarParticipanteNovoTemp(): void {
    if (!this.novoParticipanteNome.trim()) return;
    const novo = { id: Date.now(), nome: this.novoParticipanteNome.trim() };
    this.participantesCriados.push(novo);
    this.selectedParticipantes.push(novo.id);
    this.novoParticipanteNome = '';
  }
}
