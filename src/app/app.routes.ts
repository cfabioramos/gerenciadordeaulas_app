import { Routes } from '@angular/router';
import { CiclosComponent } from './components/ciclos/ciclos.component';
import { ProgramaAulasComponent } from './components/programa-aulas/programa-aulas.component';
import { AulasComponent } from './components/aulas/aulas.component';
import { PresencaComponent } from './components/presenca/presenca.component';
import { AlunosComponent } from './components/alunos/alunos.component';
import { MatriculasComponent } from './components/matriculas/matriculas.component';
import { DashboardsComponent } from './components/dashboards/dashboards.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'ciclos', component: CiclosComponent, canActivate: [authGuard] },
  { path: 'ciclos/:cicloId/programas', component: ProgramaAulasComponent, canActivate: [authGuard] },
  { path: 'programas', component: ProgramaAulasComponent, canActivate: [authGuard] },
  { path: 'programas/:programaId/aulas', component: AulasComponent, canActivate: [authGuard] },
  { path: 'aulas', component: AulasComponent, canActivate: [authGuard] },
  { path: 'aulas/:aulaId/presencas', component: PresencaComponent, canActivate: [authGuard] },
  { path: 'presenca', component: PresencaComponent, canActivate: [authGuard] },
  { path: 'alunos', component: AlunosComponent, canActivate: [authGuard] },
  { path: 'alunos/:alunoId/matriculas', component: MatriculasComponent, canActivate: [authGuard] },
  { path: 'dashboards', component: DashboardsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/ciclos', pathMatch: 'full' },
  { path: '**', redirectTo: '/ciclos' }
];
