import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramaAulasComponent } from './programa-aulas.component';

describe('ProgramaAulasComponent', () => {
  let component: ProgramaAulasComponent;
  let fixture: ComponentFixture<ProgramaAulasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramaAulasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramaAulasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
