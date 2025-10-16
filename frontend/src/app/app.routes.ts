import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { RegisterComponent } from './register.component';

import { UsuariosComponent } from './usuarios.component';
import { Routes } from '@angular/router';
import { Routes, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const authGuard: CanMatchFn = () => {
  const hasToken = !!localStorage.getItem('token');
  return hasToken ? true : inject(Router).parseUrl('/login');
};

const loginGuard: CanMatchFn = () => {
  const hasToken = !!localStorage.getItem('token');
  return hasToken ? inject(Router).parseUrl('/agenda') : true;
};

import { TurnosMedicoComponent } from './turnos-medico.component';
import { AgendarTurnoComponent } from './agendar-turno.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'usuarios', component: UsuariosComponent },
		{ path: 'turnos-medico', component: TurnosMedicoComponent },
	{ path: 'agendar-turno', component: AgendarTurnoComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canMatch: [loginGuard],
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'agenda',
    canMatch: [authGuard],
    loadComponent: () => import('./features/agenda-turnos/agenda-turnos.component').then(m => m.AgendaTurnosComponent)
  },
  { path: '**', redirectTo: 'login' }
];
