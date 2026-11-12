export interface ProgramaAula {
  id: number;
  nome: string;
  cicloId?: number;
  cicloNome?: string;
  tipoAulaId?: number | null;
  tipoAulaNome?: string;
}

export interface ProgramaAulaPayload {
  nome: string;
  ciclo: { id: number };
  tipoAula: { id: number } | null;
}
