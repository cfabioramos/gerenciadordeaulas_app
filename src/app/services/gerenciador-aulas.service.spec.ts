import { TestBed } from '@angular/core/testing';

import { GerenciadorAulasService } from './gerenciador-aulas.service';

describe('GerenciadorAulasService', () => {
  let service: GerenciadorAulasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GerenciadorAulasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
