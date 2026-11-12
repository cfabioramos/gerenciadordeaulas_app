import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventosTabService } from '../../services/eventos-tab.service';
import { GerenciadorAulasService } from '../../services/gerenciador-aulas.service';
import { AuthService } from '../../services/auth.service';
import { Aluno } from '../../models/aluno.model';
import {
  Evento,
  EventoPayload,
  ParticipanteEvento,
  ReceitaEvento
} from '../../models/evento.model';

/** Erro HTTP com o corpo padronizado do backend */
interface HttpError {
  error?: { message?: string; error?: string };
  message?: string;
}

/** Linha do formulário de datas do Evento */
interface DataEventoForm {
  data: string;    // yyyy-MM-dd (input date)
  horario: string; // HH:mm (input time)
}

@Component({
  selector: 'app-eventos-viagens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eventos-viagens.component.html',
  styleUrl: './eventos-viagens.component.css'
})
export class EventosViagensComponent implements OnInit, OnDestroy {

  // Estados da tela
  tipo: 'EVENTO' | 'VIAGEM' | null = null;
  showModal = false;
  showParticipantesModal = false;
  showFinanceiroModal = false;
  editingItem: Evento | null = null;
  selectedItemForDetails: Evento | null = null;
  searchTerm = '';
  modalLoading = false;
  loading = false;
  erroCarregamento = '';
  isAdmin = false;
  selectedAlunosTemp: number | null = null;

  // Alunos cadastrados (API)
  alunos: Aluno[] = [];

  // Participantes criados no formulário (ainda não enviados ao backend)
  participantesCriados: Array<{ id: number; nome: string }> = [];

  // Eventos e viagens vindos da API
  itens: Evento[] = [];

  // Estado do formulário de cadastro/edição
  formTipo: 'EVENTO' | 'VIAGEM' = 'EVENTO';
  formTitulo = '';
  formDescricao = '';
  formLocal = '';
  formStatus = 'AGENDADO';

  // Para Evento: array de datas/horários
  formDatas: DataEventoForm[] = [];

  // Para Viagem: saída e retorno (datetime-local: yyyy-MM-ddTHH:mm)
  formDataSaida = '';
  formDataRetorno = '';

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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly eventosTab: EventosTabService,
    private readonly svc: GerenciadorAulasService,
    private readonly auth: AuthService
  ) {}

  private tabSub: Subscription | null = null;

  ngOnInit(): void {
    // Sincroniza com a seleção do menu lateral (funciona mesmo quando
    // a rota /eventos já está ativa e o componente não é recriado)
    this.tabSub = this.eventosTab.tab$.subscribe(t => this.tipo = t);

    // Aba inicial conforme a rota de acesso:
    // /eventos → aba Eventos | /viagens → aba Viagens
    const path = this.route.snapshot.url.map(seg => seg.path).join('/');
    this.tipo = path === 'viagens' ? 'VIAGEM' : 'EVENTO';

    this.isAdmin = this.auth.isAdmin();
    this.carregarAlunos();
    this.carregarEventos();
  }

  ngOnDestroy(): void {
    this.tabSub?.unsubscribe();
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

  get itensFiltrados(): Evento[] {
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
    return (this.selectedItemForDetails.receitas || []).reduce((acc, r) => acc + r.valor, 0);
  }

  get totalDespesas(): number {
    if (!this.selectedItemForDetails) return 0;
    return (this.selectedItemForDetails.despesas || []).reduce((acc, d) => acc + d.valor, 0);
  }

  get saldo(): number {
    return this.totalReceitas - this.totalDespesas;
  }

  /** Participantes do evento selecionado que não são alunos cadastrados */
  get participantesNaoAlunos(): ParticipanteEvento[] {
    return (this.selectedItemForDetails?.participantes || [])
      .filter(p => !this.ehAlunoNome(p.nome));
  }

  // --- Carga de dados ---

  private carregarAlunos(): void {
    this.svc.getAlunos().subscribe({
      next: alunos => this.alunos = alunos,
      error: () => this.erroCarregamento = 'Erro ao carregar alunos.'
    });
  }

  carregarEventos(): void {
    this.loading = true;
    this.erroCarregamento = '';
    this.svc.getEventos().subscribe({
      next: eventos => {
        this.itens = eventos.map(e => this.preparar(e));
        this.loading = false;
        this.sincronizarSelecionados();
      },
      error: () => {
        this.loading = false;
        this.erroCarregamento = 'Erro ao carregar eventos e viagens.';
      }
    });
  }

  /** Normaliza coleções vindas da API (o backend usa Set, sem ordem garantida) */
  private preparar(e: Evento): Evento {
    e.dias = (e.dias || []).sort((a, b) => (a.dataEvento || '').localeCompare(b.dataEvento || ''));
    e.participantes = (e.participantes || []).sort((a, b) => a.nome.localeCompare(b.nome));
    e.receitas = (e.receitas || []).sort((a, b) => a.id - b.id);
    e.despesas = (e.despesas || []).sort((a, b) => a.id - b.id);
    return e;
  }

  /** Reaponta os itens selecionados nos modais para as versões recarregadas */
  private sincronizarSelecionados(): void {
    if (this.selectedItemForDetails) {
      const id = this.selectedItemForDetails.id;
      this.selectedItemForDetails = this.itens.find(i => i.id === id) ?? null;
      if (!this.selectedItemForDetails) {
        this.showParticipantesModal = false;
        this.showFinanceiroModal = false;
      }
    }
    if (this.editingItem) {
      const id = this.editingItem.id;
      this.editingItem = this.itens.find(i => i.id === id) ?? null;
    }
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

  editarItem(item: Evento): void {
    this.editingItem = item;
    this.formTipo = item.tipo;
    this.formTitulo = item.titulo;
    this.formDescricao = item.descricao || '';
    this.formLocal = item.local || '';
    this.formStatus = item.status;

    // Separa os participantes entre alunos já cadastrados e demais
    this.selectedAlunos = [];
    this.participantesCriados = [];
    this.selectedParticipantes = [];
    for (const p of (item.participantes || [])) {
      const aluno = this.alunos.find(a => this.mesmoNome(a.nome, p.nome));
      if (aluno) {
        this.selectedAlunos.push(aluno.id);
      } else {
        this.participantesCriados.push({ id: p.id, nome: p.nome });
        this.selectedParticipantes.push(p.id);
      }
    }

    if (item.tipo === 'EVENTO') {
      this.formDatas = (item.dias || []).map(d => ({ data: d.dataEvento, horario: d.horario }));
    } else {
      this.formDataSaida = (item.dataInicio || '').substring(0, 16);
      this.formDataRetorno = (item.dataFim || '').substring(0, 16);
    }

    this.showModal = true;
  }

  excluirItem(item: Evento): void {
    if (!confirm(`Tem certeza que deseja excluir "${item.titulo}"?`)) return;
    this.svc.deletarEvento(item.id).subscribe({
      next: () => this.carregarEventos(),
      error: (err: HttpError) => alert('Erro ao excluir: ' + this.mensagemErro(err))
    });
  }

  limparFormulario(): void {
    this.formTitulo = '';
    this.formDescricao = '';
    this.formLocal = '';
    this.formStatus = 'AGENDADO';
    this.formDatas = [];
    this.formDataSaida = '';
    this.formDataRetorno = '';
    this.selectedAlunos = [];
    this.selectedParticipantes = [];
    this.participantesCriados = [];
    this.novoParticipanteNome = '';
  }

  adicionarDataEvento(): void {
    this.formDatas.push({ data: '', horario: '' });
  }

  removerDataEvento(index: number): void {
    this.formDatas.splice(index, 1);
  }

  // --- Salvar formulário (criar/editar via API) ---
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
      for (const d of this.formDatas) {
        if (!d.data || !d.horario) {
          alert('Preencha todas as datas e horários do Evento.');
          return;
        }
      }
    } else {
      if (!this.formDataSaida || !this.formDataRetorno) {
        alert('Data/Hora de saída e retorno são obrigatórios para Viagem.');
        return;
      }
    }

    const payload = this.montarPayload();
    this.modalLoading = true;

    const requisicao = this.editingItem
      ? this.svc.atualizarEvento(this.editingItem.id, payload)
      : this.svc.criarEvento(payload);

    requisicao.subscribe({
      next: () => {
        this.modalLoading = false;
        this.showModal = false;
        this.editingItem = null;
        this.limparFormulario();
        this.carregarEventos();
      },
      error: (err: HttpError) => {
        this.modalLoading = false;
        alert('Erro ao salvar: ' + this.mensagemErro(err));
      }
    });
  }

  /** Monta o payload conforme o contrato do backend (/api/eventos) */
  private montarPayload(): EventoPayload {
    const nomesVistos = new Set<string>();
    const participantes: Array<{ nome: string }> = [];
    const adicionar = (nome: string): void => {
      const chave = nome.trim().toLowerCase();
      if (!chave || nomesVistos.has(chave)) return;
      nomesVistos.add(chave);
      participantes.push({ nome: nome.trim() });
    };
    this.selectedAlunos
      .map(id => this.alunos.find(a => a.id === id))
      .filter((a): a is Aluno => !!a)
      .forEach(a => adicionar(a.nome));
    this.participantesCriados
      .filter(p => this.selectedParticipantes.includes(p.id))
      .forEach(p => adicionar(p.nome));

    const base = {
      titulo: this.formTitulo.trim(),
      descricao: this.formDescricao.trim(),
      tipo: this.formTipo,
      local: this.formLocal.trim() || null,
      status: this.formStatus,
      participantes
    };

    if (this.formTipo === 'EVENTO') {
      const datas = [...this.formDatas].sort((a, b) => a.data.localeCompare(b.data));
      return {
        ...base,
        dias: datas.map(d => ({ dataEvento: d.data, horario: d.horario })),
        dataInicio: `${datas[0].data}T${datas[0].horario}:00`,
        dataFim: `${datas[datas.length - 1].data}T${datas[datas.length - 1].horario}:00`,
        horarioInicio: datas[0].horario,
        horarioFim: datas[datas.length - 1].horario
      };
    }

    return {
      ...base,
      dias: [],
      dataInicio: this.comSegundos(this.formDataSaida),
      dataFim: this.comSegundos(this.formDataRetorno),
      horarioInicio: this.formDataSaida.substring(11, 16),
      horarioFim: this.formDataRetorno.substring(11, 16)
    };
  }

  private comSegundos(valor: string): string {
    return valor.length === 16 ? `${valor}:00` : valor;
  }

  // --- Participantes Modal (operações imediatas na API) ---
  abrirParticipantes(item: Evento): void {
    this.selectedItemForDetails = item;
    this.novoParticipanteNome = '';
    this.selectedAlunosTemp = null;
    this.showParticipantesModal = true;
  }

  adicionarAlunoTemp(): void {
    if (!this.selectedAlunosTemp) return;
    const aluno = this.alunos.find(a => a.id === this.selectedAlunosTemp);
    this.selectedAlunosTemp = null;
    if (aluno) this.adicionarParticipanteApi(aluno.nome);
  }

  adicionarParticipanteNovoTemp(): void {
    const nome = this.novoParticipanteNome.trim();
    if (!nome) {
      alert('Informe o nome do participante.');
      return;
    }
    this.novoParticipanteNome = '';
    this.adicionarParticipanteApi(nome);
  }

  private adicionarParticipanteApi(nome: string): void {
    const item = this.selectedItemForDetails;
    if (!item) return;
    if ((item.participantes || []).some(p => this.mesmoNome(p.nome, nome))) {
      alert('Este participante já está associado ao evento.');
      return;
    }
    this.modalLoading = true;
    this.svc.criarParticipante({ nome, evento: { id: item.id } }).subscribe({
      next: () => {
        this.modalLoading = false;
        this.carregarEventos();
      },
      error: (err: HttpError) => {
        this.modalLoading = false;
        alert('Erro ao adicionar participante: ' + this.mensagemErro(err));
      }
    });
  }

  removerParticipanteApi(p: ParticipanteEvento): void {
    if (!this.selectedItemForDetails) return;
    if (!confirm(`Remover o participante "${p.nome}" deste evento?`)) return;
    this.modalLoading = true;
    this.svc.deletarParticipante(p.id).subscribe({
      next: () => {
        this.modalLoading = false;
        this.carregarEventos();
      },
      error: (err: HttpError) => {
        this.modalLoading = false;
        alert('Erro ao remover participante: ' + this.mensagemErro(err));
      }
    });
  }

  // --- Participantes no formulário (seleção local, enviada no save) ---
  adicionarParticipante(): void {
    const nome = this.novoParticipanteNome.trim();
    if (!nome) {
      alert('Informe o nome do participante.');
      return;
    }
    const jaExiste = this.participantesCriados.some(p => this.mesmoNome(p.nome, nome)) ||
      this.selectedAlunos.some(id => this.mesmoNome(this.getNomeAluno(id), nome));
    if (jaExiste) {
      alert('Este participante já foi adicionado.');
      return;
    }
    const novo = { id: Date.now(), nome };
    this.participantesCriados.push(novo);
    if (!this.selectedParticipantes.includes(novo.id)) {
      this.selectedParticipantes.push(novo.id);
    }
    this.novoParticipanteNome = '';
  }

  removerParticipanteSelecionado(id: number, tipo: 'ALUNO' | 'PARTICIPANTE'): void {
    if (tipo === 'ALUNO') {
      this.selectedAlunos = this.selectedAlunos.filter(x => x !== id);
    } else {
      this.selectedParticipantes = this.selectedParticipantes.filter(x => x !== id);
    }
  }

  toggleParticipante(id: number): void {
    if (this.selectedParticipantes.includes(id)) {
      this.selectedParticipantes = this.selectedParticipantes.filter(x => x !== id);
    } else {
      this.selectedParticipantes.push(id);
    }
  }

  // --- Financeiro Modal ---
  abrirDetalhesFinanceiros(item: Evento): void {
    this.abrirFinanceiro(item, 'RECEITA');
  }

  abrirFinanceiro(item: Evento, modalTipo: 'RECEITA' | 'DESPESA'): void {
    this.selectedItemForDetails = item;
    this.modalTipo = modalTipo;
    this.formDescricaoFinanceiro = '';
    this.formValorFinanceiro = 0;
    this.formTipoReferencia = 'ALUNO';
    this.formReferenciaId = this.alunos[0]?.id ?? null;
    this.showFinanceiroModal = true;
  }

  alternarTipoReferencia(tipo: 'ALUNO' | 'PARTICIPANTE'): void {
    this.formTipoReferencia = tipo;
    this.formReferenciaId = tipo === 'ALUNO'
      ? (this.alunos[0]?.id ?? null)
      : (this.participantesNaoAlunos[0]?.id ?? null);
  }

  salvarFinanceiro(): void {
    const item = this.selectedItemForDetails;
    if (!item) return;
    if (!this.formDescricaoFinanceiro || this.formValorFinanceiro <= 0) {
      alert('Descrição e valor são obrigatórios.');
      return;
    }

    if (this.modalTipo === 'DESPESA') {
      this.modalLoading = true;
      this.svc.criarDespesa({
        descricao: this.formDescricaoFinanceiro,
        valor: this.formValorFinanceiro,
        evento: { id: item.id }
      }).subscribe({
        next: () => this.aposLancamentoFinanceiro(),
        error: (err: HttpError) => this.erroLancamento(err)
      });
      return;
    }

    // RECEITA: a referência é gravada em receita.participante_id
    if (this.formReferenciaId == null) {
      alert('Selecione a referência (aluno ou participante).');
      return;
    }

    this.modalLoading = true;

    if (this.formTipoReferencia === 'PARTICIPANTE') {
      const participante = (item.participantes || []).find(p => p.id === this.formReferenciaId);
      if (!participante) {
        this.modalLoading = false;
        alert('Participante não encontrado. Atualize a lista e tente novamente.');
        return;
      }
      this.criarReceitaCom(item, participante.id);
      return;
    }

    const aluno = this.alunos.find(a => a.id === this.formReferenciaId);
    if (!aluno) {
      this.modalLoading = false;
      alert('Aluno não encontrado.');
      return;
    }
    const existente = (item.participantes || []).find(p => this.mesmoNome(p.nome, aluno.nome));
    if (existente) {
      this.criarReceitaCom(item, existente.id);
      return;
    }
    // Aluno ainda não é participante do evento: cria o vínculo antes da receita
    this.svc.criarParticipante({ nome: aluno.nome, evento: { id: item.id } }).subscribe({
      next: novo => this.criarReceitaCom(item, novo.id),
      error: (err: HttpError) => this.erroLancamento(err)
    });
  }

  private criarReceitaCom(item: Evento, participanteId: number): void {
    this.svc.criarReceita({
      descricao: this.formDescricaoFinanceiro,
      valor: this.formValorFinanceiro,
      evento: { id: item.id },
      participante: { id: participanteId }
    }).subscribe({
      next: () => this.aposLancamentoFinanceiro(),
      error: (err: HttpError) => this.erroLancamento(err)
    });
  }

  private aposLancamentoFinanceiro(): void {
    this.modalLoading = false;
    this.formDescricaoFinanceiro = '';
    this.formValorFinanceiro = 0;
    this.formReferenciaId = this.formTipoReferencia === 'ALUNO'
      ? (this.alunos[0]?.id ?? null)
      : (this.participantesNaoAlunos[0]?.id ?? null);
    this.carregarEventos();
  }

  private erroLancamento(err: HttpError): void {
    this.modalLoading = false;
    alert('Erro ao salvar: ' + this.mensagemErro(err));
  }

  removerReceita(id: number): void {
    this.modalLoading = true;
    this.svc.deletarReceita(id).subscribe({
      next: () => {
        this.modalLoading = false;
        this.carregarEventos();
      },
      error: (err: HttpError) => {
        this.modalLoading = false;
        alert('Erro ao remover receita: ' + this.mensagemErro(err));
      }
    });
  }

  removerDespesa(id: number): void {
    this.modalLoading = true;
    this.svc.deletarDespesa(id).subscribe({
      next: () => {
        this.modalLoading = false;
        this.carregarEventos();
      },
      error: (err: HttpError) => {
        this.modalLoading = false;
        alert('Erro ao remover despesa: ' + this.mensagemErro(err));
      }
    });
  }

  // --- Helpers de template ---
  formatarDataBR(dataStr: string | undefined): string {
    if (!dataStr) return '';
    const somenteData = dataStr.split('T')[0];
    if (somenteData.includes('/')) return somenteData;
    const parts = somenteData.split('-');
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

  /** Classifica a referência da receita: Aluno (nome confere) ou Participante */
  getDescricaoReferenciaReceita(r: ReceitaEvento): string {
    const nome = r.participante?.nome;
    if (!nome) return '—';
    return `${this.ehAlunoNome(nome) ? 'Aluno' : 'Participante'}: ${nome}`;
  }

  /** true quando o nome corresponde a um aluno cadastrado */
  ehAlunoNome(nome: string | undefined): boolean {
    if (!nome) return false;
    return this.alunos.some(a => this.mesmoNome(a.nome, nome));
  }

  getNomeAluno(id: number): string {
    const a = this.alunos.find(x => x.id === id);
    return a ? a.nome : '';
  }

  getNomeParticipante(id: number): string {
    const p = this.participantesCriados.find(x => x.id === id);
    return p ? p.nome : '';
  }

  private mesmoNome(a: string | undefined, b: string | undefined): boolean {
    if (!a || !b) return false;
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }

  private mensagemErro(err: HttpError): string {
    return err?.error?.message || err?.error?.error || err?.message || 'Tente novamente.';
  }
}
