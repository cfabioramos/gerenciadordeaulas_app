import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { provideAppTesting, resetBrowserState } from '../../../testing/test-providers';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    resetBrowserState();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: provideAppTesting(),
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve exigir credenciais ao enviar', () => {
    component.onSubmit();
    expect(component.errorMessage).toContain('preencha todos os campos');
  });

  it('currentTheme deve refletir localStorage', () => {
    localStorage.setItem('theme', 'frevo');
    expect(component.currentTheme).toBe('frevo');
  });

  it('changeTheme deve persistir e aplicar', () => {
    component.changeTheme('forro');
    expect(localStorage.getItem('theme')).toBe('forro');
  });
});
