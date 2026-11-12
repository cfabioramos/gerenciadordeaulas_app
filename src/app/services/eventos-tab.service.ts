import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TipoEventoViagem = 'EVENTO' | 'VIAGEM';

/**
 * Comunica a intenção do menu lateral para o componente de Eventos e Viagens.
 * É necessário porque a navegação para a mesma URL (usuário já em /eventos)
 * é ignorada pelo Angular Router e o componente não é recriado — sem isto,
 * a aba pré-selecionada não seria redefinida.
 */
@Injectable({ providedIn: 'root' })
export class EventosTabService {
  private readonly tabSubject = new BehaviorSubject<TipoEventoViagem>('EVENTO');
  readonly tab$ = this.tabSubject.asObservable();

  select(tab: TipoEventoViagem): void {
    this.tabSubject.next(tab);
  }
}
