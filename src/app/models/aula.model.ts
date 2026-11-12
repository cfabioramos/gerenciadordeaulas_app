export interface Aula {
  id: number;
  nome: string;
  data: string;
  programaAulaId?: number;
  programaAulaNome?: string;
}

export interface AulaPayload {
  nome: string;
  data: string;
  programaAula: { id: number };
}
