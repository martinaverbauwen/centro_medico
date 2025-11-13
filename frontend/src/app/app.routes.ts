import { Routes } from '@angular/router';

import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { RegisterComponent } from './register.component';
import { UsuariosComponent } from './usuarios.component';
import { TurnosMedicoComponent } from './turnos-medico.component';
import { AgendarTurnoComponent } from './agendar-turno.component';

import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

export const routes: Routes = [
  // inicio → login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // dashboard = página principal para CUALQUIER usuario logueado
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],          // 👈 solo exige estar logueado
    // sin roleGuard acá, el HTML se encarga de mostrar cosas según userRole
  },

  // solo admin / secretario
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador', 'secretario'] }
  },

  // solo médicos
  {
    path: 'turnos-medico',
    component: TurnosMedicoComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['medico'] }
  },

  // pacientes / clientes
  {
    path: 'agendar-turno',
    component: AgendarTurnoComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['paciente', 'cliente'] }
  },

  // cualquier otra ruta → login
  { path: '**', redirectTo: 'login' }
];
