import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // si no está logueado: fuera
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expected: string[] = (route.data?.['roles'] || []) as string[];

  // si la ruta no pide roles específicos, alcanza con estar logueado
  if (!expected.length) return true;

  if (auth.hasAnyRole(expected)) {
    return true;
  }

  // rol incorrecto → lo mando a la ruta correspondiente a su rol
  const user = auth.getUser();
  const rol = (user?.rol || '').toLowerCase();

  if (rol === 'medico')        router.navigate(['/turnos-medico']);
  else if (rol === 'administrador') router.navigate(['/dashboard']);
  else                          router.navigate(['/agendar-turno']); // paciente/cliente

  return false;
};
