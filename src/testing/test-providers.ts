import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

/**
 * Providers padrão para testes de componentes/serviços standalone.
 * Inclui HttpClient de teste, router vazio, Location mockado e um
 * ActivatedRoute neutro (necessário ao montar componentes roteados fora do Router).
 */
export function provideAppTesting(): Array<Provider | EnvironmentProviders> {
  return [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
    provideLocationMocks(),
    { provide: ActivatedRoute, useValue: activatedRouteStub() },
  ];
}

/**
 * Stub de ActivatedRoute com os membros usados pelos componentes do projeto.
 * `snapshot.url` vazio mantém a aba padrão (Eventos) no módulo de Eventos e Viagens.
 */
export function activatedRouteStub(): ActivatedRoute {
  const paramMap = convertToParamMap({});
  const snapshot = {
    paramMap,
    queryParamMap: convertToParamMap({}),
    url: [] as { path: string }[],
    params: {},
    queryParams: {},
    data: {},
    fragment: null,
    outlet: 'primary',
    component: null,
    routeConfig: null,
  };

  return {
    paramMap: of(paramMap),
    queryParamMap: of(convertToParamMap({})),
    url: of([]),
    params: of({}),
    queryParams: of({}),
    data: of({}),
    fragment: of(null),
    outlet: 'primary',
    component: null,
    routeConfig: null,
    snapshot,
    root: undefined,
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
  } as unknown as ActivatedRoute;
}

/** Limpa estado global (tema, sessão e classes do body) entre testes. */
export function resetBrowserState(): void {
  localStorage.clear();
  document.body.className = '';
}
