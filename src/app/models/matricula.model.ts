export interface Matricula {
  alunoId: number;
  alunoNome: string;
  data: string;
  id: number;
  presencaId: number | null;
  presente: boolean;
  programaAulaId: number;
  programaAulaNome: string;
  flAtivo?: boolean;
}