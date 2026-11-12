export interface PagamentoMatricula {
  id: number;
  valorMensalidadeDia?: number;
  matriculaId?: number;
  programaAulaNome?: string;
}

export interface Pagamento {
  id: number;
  valor?: number;
  data: string;
  alunoId?: number;
  alunoNome?: string;
  cicloId?: number;
  cicloNome?: string;
  itens: PagamentoMatricula[];
}

export interface CadastroPagamentoPayload {
  valor: number;
  data: string;
  matriculaIds: number[];
}

export interface EditarPagamentoPayload {
  valor: number;
  data: string;
}
