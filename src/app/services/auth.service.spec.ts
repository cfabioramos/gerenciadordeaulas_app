import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { API_URL } from './gerenciador-aulas.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  it('isAdmin retorna false por padrão', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    expect(svc.isAdmin()).toBeFalse();
  });

  it('persiste isAdmin quando true no localStorage', () => {
    localStorage.setItem('isAdmin', 'true');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    expect(svc.isAdmin()).toBeTrue();
  });

  it('isLoggedIn retorna false sem token', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    expect(svc.isLoggedIn()).toBeFalse();
  });

  it('applyTheme adiciona classe no body e emite no subject', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    let emitted: string | undefined;
    svc.themeChange$.subscribe((t) => (emitted = t));
    svc.applyTheme('forro');
    expect(document.body.classList.contains('theme-forro')).toBeTrue();
    expect(emitted).toBe('forro');
  });

  it('updateTheme quando não logado retorna observable de sucesso', (done) => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    svc.updateTheme('frevo').subscribe((res: any) => {
      expect(res.success).toBeTrue();
      expect(res.theme).toBe('frevo');
      done();
    });
  });

  it('login faz POST e persiste token', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    const ctrl = TestBed.inject(HttpTestingController);
    svc.login({ usernameOrEmail: 'u', password: 'p' }).subscribe();
    const req = ctrl.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'jwt', username: 'u', nome: 'Nome', admin: true, theme: 'frevo' });
    expect(localStorage.getItem('token')).toBe('jwt');
    expect(localStorage.getItem('username')).toBe('u');
    expect(localStorage.getItem('isAdmin')).toBe('true');
    ctrl.verify();
  });

  it('logout limpa sessão e navega para /login', () => {
    localStorage.setItem('token', 't');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const svc = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    svc.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});
