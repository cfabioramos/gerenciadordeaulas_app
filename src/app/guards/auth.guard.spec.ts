import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { provideAppTesting, resetBrowserState } from '../../testing/test-providers';

describe('authGuard', () => {
  beforeEach(() => resetBrowserState());

  it('permite acesso quando há token válido', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('token_expiration', String(Date.now() + 60_000));
    TestBed.configureTestingModule({ providers: provideAppTesting() });
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('bloqueia e redireciona quando não há token', () => {
    TestBed.configureTestingModule({ providers: provideAppTesting() });
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});
