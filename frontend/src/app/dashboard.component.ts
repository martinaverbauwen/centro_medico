import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  today = new Date();
  user: any = null;
  turnos: any[] = [];
  cargandoTurnos = false;
  errorTurnos = '';

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) {
    this.user = this.auth.getUser();
    this.cargarTurnosUsuario();
  }

  get fechaArgentina(): string {
    return this.today.toLocaleDateString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  }

  get userName(): string {
    if (!this.user) return '';
    return this.user.nombre + (this.user.apellido ? ' ' + this.user.apellido : '');
  }
  get userRole(): string {
    if (!this.user) return '';
    return this.user.rol?.nombre || '';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  agendarTurno() {
    this.router.navigate(['/agendar-turno']);
  }

  cargarTurnosUsuario() {
    if (!this.user || !this.user.id) return;
    const rol = this.user.rol?.nombre;
    if (rol === 'paciente' || rol === 'cliente' || rol === 'Paciente') {
      this.cargandoTurnos = true;
      this.http.get<any>(`http://localhost:8000/api/turnos?paciente_id=${this.user.id}`).subscribe({
        next: (res) => {
          this.turnos = res.data || [];
          this.cargandoTurnos = false;
        },
        error: () => {
          this.errorTurnos = 'No se pudieron cargar los turnos.';
          this.cargandoTurnos = false;
        }
      });
    }
  }
}
