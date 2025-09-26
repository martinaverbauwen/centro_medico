import { Component, signal } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { RegisterComponent } from './register.component';
import { UsuariosComponent } from './usuarios.component';
import { TurnosMedicoComponent } from './turnos-medico.component';
import { AgendarTurnoComponent } from './agendar-turno.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, DashboardComponent, RegisterComponent, UsuariosComponent, TurnosMedicoComponent, AgendarTurnoComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Centro Medico');
}
