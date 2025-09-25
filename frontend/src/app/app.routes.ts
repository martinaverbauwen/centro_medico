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

export const routes: Routes = [
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
