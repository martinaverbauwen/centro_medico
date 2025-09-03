
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { RegisterComponent } from './register.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'dashboard', component: DashboardComponent },
];
