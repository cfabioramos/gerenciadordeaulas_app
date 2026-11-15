import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  beforeEach(() => localStorage.clear());

  it('adiciona header Bearer quando há token', () => {
    localStorage.setItem('token', 'abc');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([])],
    });
    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);
    http.get('/x').subscribe();
    const req = ctrl.expectOne('/x');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({});
    ctrl.verify();
  });

  it('não adiciona header quando não há token', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([])],
    });
    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);
    http.get('/x').subscribe();
    const req = ctrl.expectOne('/x');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
    ctrl.verify();
  });

  it('limpa sessão e redireciona no 401', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('username', 'u');
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('token_expiration', '1');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([])],
    });
    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    http.get('/x').subscribe({ error: () => {} });
    const req = ctrl.expectOne('/x');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(localStorage.getItem('token')).toBeNull();
    expect(spy).toHaveBeenCalledWith(['/login']);
    ctrl.verify();
  });
});
