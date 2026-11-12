export interface Matricula {
  id: number;
  data: string;
  alunoId: number;
  alunoNome: string;
  programaAulaId: number;
  programaAulaNome: string;
  presente: boolean;
  presencaId: number | null;
  flAtivo?: boolean;
  valor?: number | null;
  valorMensalidade?: number | null;
  diaVencimento?: number | null;
  cicloDataInicio?: string;
  cicloDataFim?: string;
}

export interface CadastroMatriculaPayload {
  alunoId: number;
  programaAulaId: number;
  data: string;
  valor?: number | null;
  valorMensalidade?: number | null;
  diaVencimento?: number | null;
}

export interface AtualizarMatriculaPayload {
  valor?: number | null;
  valorMensalidade?: number | null;
  diaVencimento?: number | null;
}
