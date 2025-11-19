// src/app/turnos-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TurnosMedicoService } from './turnos-medico.service';

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos-admin.component.html',
  styleUrls: ['./turnos-admin.component.scss'],
})
export class TurnosAdminComponent implements OnInit {
  turnos: any[] = [];

  medicos: any[] = [];
  pacientes: any[] = [];
  especialidades: any[] = [];

  loading = false;
  error = '';

  nuevoTurno = {
    paciente_id: '',
    medico_id: '',
    especialidad_id: '',
    fecha: '',
    hora: '',
    motivo: '',
  };

  constructor(
    private http: HttpClient,
    private turnosService: TurnosMedicoService
  ) {}

  ngOnInit(): void {
    this.cargarCombos();
    this.cargarTurnos();
  }

  // --------- Carga de combos ---------
  cargarCombos(): void {
    this.error = '';

    // Médicos (usa /api/medicos que ya tenés)
    this.http.get<any[]>('http://localhost:8000/api/medicos').subscribe({
      next: (res) => (this.medicos = res || []),
      error: () => (this.error = 'Error al cargar médicos'),
    });

    // Pacientes (usa /api/usuarios?rol=paciente)
    const paramsPac = new HttpParams()
      .set('rol', 'paciente')
      .set('per_page', '200');

    this.http
      .get<any>('http://localhost:8000/api/usuarios', { params: paramsPac })
      .subscribe({
        next: (res) => (this.pacientes = res?.data || []),
        error: () => (this.error = 'Error al cargar pacientes'),
      });

    // Especialidades
    this.http
      .get<any[]>('http://localhost:8000/api/especialidades')
      .subscribe({
        next: (res) => (this.especialidades = res || []),
        error: () => (this.error = 'Error al cargar especialidades'),
      });
  }

  // --------- Carga de turnos ---------
  cargarTurnos(): void {
    this.loading = true;
    this.error = '';

    this.turnosService.getTurnos().subscribe({
      next: (data) => {
        this.turnos = data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar turnos';
        this.loading = false;
      },
    });
  }

  // --------- Crear turno ---------
  crearTurno(): void {
    this.error = '';

    if (
      !this.nuevoTurno.paciente_id ||
      !this.nuevoTurno.medico_id ||
      !this.nuevoTurno.especialidad_id ||
      !this.nuevoTurno.fecha ||
      !this.nuevoTurno.hora
    ) {
      this.error = 'Completá todos los campos obligatorios.';
      return;
    }

    const payload = {
      paciente_id: Number(this.nuevoTurno.paciente_id),
      medico_id: Number(this.nuevoTurno.medico_id),
      especialidad_id: Number(this.nuevoTurno.especialidad_id),
      fecha_hora: `${this.nuevoTurno.fecha} ${this.nuevoTurno.hora}:00`,
      motivo: this.nuevoTurno.motivo || null,
    };

    this.turnosService.agendarTurno(payload).subscribe({
      next: () => {
        this.nuevoTurno = {
          paciente_id: '',
          medico_id: '',
          especialidad_id: '',
          fecha: '',
          hora: '',
          motivo: '',
        };
        this.cargarTurnos();
      },
      error: (err) => {
        this.error =
          err?.error?.message || 'Error al crear el turno. Revisá los datos.';
      },
    });
  }

  // --------- Eliminar turno ---------
  eliminarTurno(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este turno?')) return;

    this.turnosService.eliminarTurno(id).subscribe({
      next: () => {
        this.turnos = this.turnos.filter((t) => t.id !== id);
      },
      error: () => {
        this.error = 'Error al eliminar el turno.';
      },
    });
  }

  // Helpers para mostrar nombres en tabla
  nombrePaciente(t: any): string {
    const p = t.paciente;
    if (!p) return '-';
    return `${p.apellido || ''} ${p.nombre || ''}`.trim();
  }

  nombreMedico(t: any): string {
    const m = t.medico;
    if (!m) return '-';
    return `Dr/a. ${(m.apellido || '')} ${(m.nombre || '')}`.trim();
  }

  nombreEspecialidad(t: any): string {
    return t.especialidad?.nombre || '-';
  }
}
