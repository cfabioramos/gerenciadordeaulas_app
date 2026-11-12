// Modelo de Eventos e Viagens (espelha o backend /api/eventos)

export interface EventoDia {
  id?: number;
  dataEvento: string; // yyyy-MM-dd
  horario: string; // HH:mm
}

export interface ParticipanteEvento {
  id: number;
  nome: string;
}

export interface ReceitaEvento {
  id: number;
  descricao: string;
  valor: number;
  participante?: { id: number; nome?: string } | null;
  dataLancamento?: string;
}

export interface DespesaEvento {
  id: number;
  descricao: string;
  valor: number;
  dataLancamento?: string;
}

export interface Evento {
  id: number;
  titulo: string;
  descricao?: string;
  tipo: 'EVENTO' | 'VIAGEM';
  dataInicio?: string; // yyyy-MM-ddTHH:mm:ss
  dataFim?: string;
  horarioInicio?: string; // HH:mm
  horarioFim?: string;
  local?: string;
  status: string;
  participantesQtd?: number;
  dias?: EventoDia[];
  participantes?: ParticipanteEvento[];
  receitas?: ReceitaEvento[];
  despesas?: DespesaEvento[];
}

export interface EventoPayload {
  titulo: string;
  descricao: string;
  tipo: 'EVENTO' | 'VIAGEM';
  local?: string | null;
  status: string;
  dataInicio: string;
  dataFim?: string;
  horarioInicio?: string;
  horarioFim?: string;
  dias?: EventoDia[];
  participantes?: Array<{ id?: number; nome: string }>;
}

export interface ParticipantePayload {
  nome: string;
  evento: { id: number };
}

export interface ReceitaPayload {
  descricao: string;
  valor: number;
  evento: { id: number };
  participante?: { id: number };
}

export interface DespesaPayload {
  descricao: string;
  valor: number;
  evento: { id: number };
}
