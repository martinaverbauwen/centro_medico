import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { TurnosMedicoService } from './turnos-medico.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe]
})
export class DashboardComponent {
  today = new Date();
  user: any = null;
  turnos: any[] = [];
  cargandoTurnos = false;
  errorTurnos = '';

  // Variables para el modal de confirmación
  mostrarModalCancelar = false;
  turnoACancelar: any = null;
  fechaTurnoACancelar = '';

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private http: HttpClient,
    private turnosService: TurnosMedicoService,
    private datePipe: DatePipe
  ) {
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

  // Cancelar turno (mostrar modal de confirmación)
  cancelarTurno(turno: any) {
    this.turnoACancelar = turno;
    this.fechaTurnoACancelar = this.datePipe.transform(turno.fecha_hora, 'dd/MM/yyyy HH:mm') || '';
    this.mostrarModalCancelar = true;
  }

  // Cerrar modal de confirmación
  cerrarModal() {
    this.mostrarModalCancelar = false;
    this.turnoACancelar = null;
    this.fechaTurnoACancelar = '';
  }

  // Confirmar cancelación (eliminar turno)
  confirmarCancelacion() {
    if (this.turnoACancelar) {
      this.turnosService.eliminarTurno(this.turnoACancelar.id).subscribe({
        next: (response) => {
          // Eliminar el turno del array local
          const index = this.turnos.findIndex(t => t.id === this.turnoACancelar.id);
          if (index > -1) {
            this.turnos.splice(index, 1);
          }
          console.log('Turno eliminado exitosamente');
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al eliminar turno:', error);
          this.errorTurnos = 'Error al cancelar el turno. Intenta nuevamente.';
          this.cerrarModal();
        }
      });
    }
  }
}
