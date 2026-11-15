import { TestBed } from '@angular/core/testing';
import { provideAppTesting, resetBrowserState } from '../../testing/test-providers';

import { EventosTabService } from './eventos-tab.service';

describe('EventosTabService', () => {
  beforeEach(() => resetBrowserState());

  it('emite EVENTO como valor inicial', () => {
    TestBed.configureTestingModule({ providers: provideAppTesting() });
    const svc = TestBed.inject(EventosTabService);
    let last: string | undefined;
    svc.tab$.subscribe((v) => (last = v));
    expect(last).toBe('EVENTO');
  });

  it('select altera o valor emitido', () => {
    TestBed.configureTestingModule({ providers: provideAppTesting() });
    const svc = TestBed.inject(EventosTabService);
    let last: string | undefined;
    svc.tab$.subscribe((v) => (last = v));
    svc.select('VIAGEM');
    expect(last).toBe('VIAGEM');
  });
});
