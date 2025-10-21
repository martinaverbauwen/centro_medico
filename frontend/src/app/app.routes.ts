import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { RegisterComponent } from './register.component';

import { UsuariosComponent } from './usuarios.component';
import { Routes } from '@angular/router';

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

];