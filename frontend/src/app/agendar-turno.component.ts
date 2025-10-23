import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosMedicoService } from './turnos-medico.service';
import { AgendarTurnoService } from './agendar-turno.service';

@Component({
  selector: 'app-agendar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar-turno.component.html',
  styleUrls: ['./agendar-turno.component.scss']
})
export class AgendarTurnoComponent {
  motivo = '';
  fecha = '';
  hora = '';
  medico_id: string = '';
  especialidad_id: string = '';

  especialidades: any[] = [];
  medicos: any[] = [];
  medicosFiltrados: any[] = [];

  mensaje = '';
  cargando = false;

  constructor(
    private turnosService: TurnosMedicoService,
    private agendarService: AgendarTurnoService
  ) {
    this.cargarEspecialidades();
    this.cargarMedicos(); // carga inicial (sin filtro) para mostrar todos o filtrar luego
  }

  cargarEspecialidades() {
    this.agendarService.getEspecialidades().subscribe({
      next: (data) => this.especialidades = data || [],
      error: () => this.especialidades = []
    });
  }

  cargarMedicos() {
    this.agendarService.getMedicos().subscribe({
      next: (data) => {
        this.medicos = data || [];
        this.filtrarMedicos();
      },
      error: () => {
        this.medicos = [];
        this.medicosFiltrados = [];
      }
    });
  }

  onEspecialidadChange() {
    // Si preferís traer ya filtrado desde backend, descomentá esto:
    // const esp = Number(this.especialidad_id);
    // this.agendarService.getMedicos(esp).subscribe({
    //   next: (data) => {
    //     this.medicos = data || [];
    //     this.medicosFiltrados = this.medicos;
    //     this.medico_id = '';
    //   },
    //   error: () => { this.medicos = []; this.medicosFiltrados = []; this.medico_id = ''; }
    // });

    // Filtrado en cliente (rápido y suficiente):
    this.filtrarMedicos();
    if (this.medico_id && !this.medicosFiltrados.some(m => m.id == this.medico_id)) {
      this.medico_id = '';
    }
  }

  filtrarMedicos() {
    const esp = Number(this.especialidad_id);
    this.medicosFiltrados = esp
      ? this.medicos.filter(m => Number(m.especialidad_id) === esp)
      : this.medicos;
  }

  agendar() {
    this.cargando = true;
    this.mensaje = '';

    const userRaw = localStorage.getItem('user');
    const paciente_id = userRaw ? JSON.parse(userRaw).id : null;

    // Backend espera "YYYY-MM-DD HH:mm:00"
    const fecha_hora = (this.fecha && this.hora) ? `${this.fecha} ${this.hora}:00` : '';

    const turno = {
      motivo: this.motivo || undefined,
      fecha_hora,
      paciente_id,                         // si en backend lo inferís por token, podés omitirlo
      medico_id: Number(this.medico_id),
      especialidad_id: Number(this.especialidad_id),
      estado: 'pendiente'
    };

    this.turnosService.agendarTurno(turno).subscribe({
      next: () => {
        this.mensaje = 'Turno agendado correctamente.';
        this.cargando = false;
        // Opcional: resetear formulario
        // this.motivo=''; this.fecha=''; this.hora=''; this.medico_id=''; this.especialidad_id='';
      },
      error: (err) => {
        this.mensaje = err?.error?.message || 'Error al agendar turno.';
        this.cargando = false;
      }
    });
  }
}
