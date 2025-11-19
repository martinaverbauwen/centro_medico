// src/app/especialidades.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EspecialidadService } from './especialidad.service';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.scss'],
})
export class EspecialidadesComponent implements OnInit {
  especialidades: any[] = [];

  nuevo = {
    nombre: '',
    descripcion: '',
  };

  editandoId: number | null = null;
  especialidadEdit: any = {};

  loading = false;
  error = '';

  constructor(private espService: EspecialidadService) {}

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.loading = true;
    this.error = '';
    this.espService.getEspecialidades().subscribe({
      next: (data) => {
        this.especialidades = data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar especialidades';
        this.loading = false;
      },
    });
  }

  crearEspecialidad(): void {
    if (!this.nuevo.nombre.trim()) {
      this.error = 'El nombre de la especialidad es obligatorio.';
      return;
    }

    this.error = '';
    this.espService.createEspecialidad({
      nombre: this.nuevo.nombre.trim(),
      descripcion: this.nuevo.descripcion.trim() || undefined,
    }).subscribe({
      next: () => {
        this.nuevo = { nombre: '', descripcion: '' };
        this.cargarEspecialidades();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al crear especialidad';
      },
    });
  }

  editarEspecialidad(esp: any): void {
    this.editandoId = esp.id;
    this.especialidadEdit = {
      id: esp.id,
      nombre: esp.nombre,
      descripcion: esp.descripcion || '',
    };
  }

  guardarEdicion(): void {
    if (!this.editandoId) return;
    if (!this.especialidadEdit.nombre.trim()) {
      this.error = 'El nombre de la especialidad es obligatorio.';
      return;
    }

    this.error = '';
    this.espService.updateEspecialidad(this.editandoId, {
      nombre: this.especialidadEdit.nombre.trim(),
      descripcion: this.especialidadEdit.descripcion?.trim() || undefined,
    }).subscribe({
      next: () => {
        this.editandoId = null;
        this.especialidadEdit = {};
        this.cargarEspecialidades();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al actualizar especialidad';
      },
    });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.especialidadEdit = {};
  }

  eliminarEspecialidad(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar esta especialidad?')) return;

    this.error = '';
    this.espService.deleteEspecialidad(id).subscribe({
      next: () => {
        this.especialidades = this.especialidades.filter(e => e.id !== id);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al eliminar especialidad';
      },
    });
  }
}
