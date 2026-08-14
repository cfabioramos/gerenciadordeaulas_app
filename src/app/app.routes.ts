import { Routes } from '@angular/router';
import { CiclosComponent } from './components/ciclos/ciclos.component';
import { ProgramaAulasComponent } from './components/programa-aulas/programa-aulas.component';
import { AulasComponent } from './components/aulas/aulas.component';
import { PresencaComponent } from './components/presenca/presenca.component';
import { AlunosComponent } from './components/alunos/alunos.component';
import { MatriculasComponent } from './components/matriculas/matriculas.component';
import { DashboardsComponent } from './components/dashboards/dashboards.component';

export const routes: Routes = [
  { path: 'ciclos', component: CiclosComponent },
  { path: 'ciclos/:cicloId/programas', component: ProgramaAulasComponent },
  { path: 'programas/:programaId/aulas', component: AulasComponent },
  { path: 'aulas/:aulaId/presencas', component: PresencaComponent },
  { path: 'alunos', component: AlunosComponent },
  { path: 'alunos/:alunoId/matriculas', component: MatriculasComponent },
  { path: 'dashboards', component: DashboardsComponent },
  { path: '', redirectTo: '/ciclos', pathMatch: 'full' },
];
