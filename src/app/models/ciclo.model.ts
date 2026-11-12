export interface Ciclo {
  id: number;
  nome: string;
  dataInicio: string;
  dataFim: string;
  programaAulaIds?: number[];
}

export interface CicloPayload {
  nome: string;
  dataInicio: string;
  dataFim: string;
}
