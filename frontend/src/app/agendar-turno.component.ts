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
  motivo: string = '';
  fecha: string = '';
  hora: string = '';
  medico_id: string = '';
  especialidad_id: string = '';
  medicos: any[] = [];
  especialidades: any[] = [];
  mensaje: string = '';
  cargando: boolean = false;

  constructor(private turnosService: TurnosMedicoService, private agendarService: AgendarTurnoService) {
    this.cargarMedicos();
    this.cargarEspecialidades();
  }

  cargarMedicos() {
    this.agendarService.getMedicos().subscribe({
      next: (data) => this.medicos = data,
      error: () => this.medicos = []
    });
  }
  cargarEspecialidades() {
    this.agendarService.getEspecialidades().subscribe({
      next: (data) => this.especialidades = data,
      error: () => this.especialidades = []
    });
  }

  agendar() {
    this.cargando = true;
    this.mensaje = '';
    const user = localStorage.getItem('user');
    const paciente_id = user ? JSON.parse(user).id : null;
    const turno = {
      motivo: this.motivo,
      fecha_hora: this.fecha + 'T' + this.hora,
      paciente_id,
      medico_id: this.medico_id,
      especialidad_id: this.especialidad_id
    };
    this.turnosService.agendarTurno(turno).subscribe({
      next: () => {
        this.mensaje = 'Turno agendado correctamente.';
        this.cargando = false;
      },
      error: () => {
        this.mensaje = 'Error al agendar turno.';
        this.cargando = false;
      }
    });
  }
}
