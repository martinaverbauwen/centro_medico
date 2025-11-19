import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medicos.component.html',
  styleUrls: ['./medicos.component.scss']
})
export class MedicosComponent implements OnInit {
  medicos: any[] = [];

  // listado de especialidades para el combo
  especialidades: any[] = [];

  // formulario alta de médico
  nuevoMedico: any = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    dni: '',
    telefono: '',
    especialidad_id: ''
  };

  // edición
  editando: number | null = null;
  medicoEdit: any = {};

  error: string = '';
  mostrarForm: boolean = true;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargarMedicos();
    this.cargarEspecialidades();
  }

  cargarMedicos() {
    this.usuarioService.getMedicos().subscribe({
      next: (data) => (this.medicos = data),
      error: () => (this.error = 'Error al cargar médicos')
    });
  }

  cargarEspecialidades() {
    this.usuarioService.getEspecialidades().subscribe({
      next: (data) => (this.especialidades = data),
      error: () => console.error('Error al cargar especialidades')
    });
  }

  crearMedico() {
    this.usuarioService.createMedico(this.nuevoMedico).subscribe({
      next: () => {
        this.nuevoMedico = {
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          dni: '',
          telefono: '',
          especialidad_id: ''
        };
        this.cargarMedicos();
      },
      error: () => (this.error = 'Error al crear médico')
    });
  }

  editarMedico(medico: any) {
    this.editando = medico.id;
    // clonamos para no ensuciar directamente la fila
    this.medicoEdit = {
      id: medico.id,
      nombre: medico.nombre,
      apellido: medico.apellido,
      email: medico.email,
      dni: medico.dni,
      telefono: medico.telefono,
      // si viene relación completa, tomamos el id de ahí
      especialidad_id: medico.especialidad_id ?? medico.especialidad?.id ?? ''
    };
  }

  guardarEdicion() {
    if (!this.editando) return;

    this.usuarioService.updateMedico(this.medicoEdit.id, this.medicoEdit).subscribe({
      next: () => {
        this.editando = null;
        this.medicoEdit = {};
        this.cargarMedicos();
      },
      error: () => (this.error = 'Error al editar médico')
    });
  }

  cancelarEdicion() {
    this.editando = null;
    this.medicoEdit = {};
  }

  eliminarMedico(id: number) {
    if (confirm('¿Seguro que deseas eliminar este médico?')) {
      this.usuarioService.deleteMedico(id).subscribe({
        next: () => this.cargarMedicos(),
        error: () => (this.error = 'Error al eliminar médico')
      });
    }
  }
  
}
