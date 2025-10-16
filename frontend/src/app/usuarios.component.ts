import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  nuevoUsuario: any = { nombre: '', apellido: '', email: '', rol_id: '', password: '' };
  editando: number | null = null;
  usuarioEdit: any = {};
  error: string = '';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => this.usuarios = data,
      error: () => this.error = 'Error al cargar usuarios'
    });
  }

  crearUsuario() {
    this.usuarioService.createUsuario(this.nuevoUsuario).subscribe({
      next: () => {
  this.nuevoUsuario = { nombre: '', apellido: '', email: '', rol_id: '', password: '' };
        this.cargarUsuarios();
      },
      error: () => this.error = 'Error al crear usuario'
    });
  }

  editarUsuario(usuario: any) {
    this.editando = usuario.id;
    this.usuarioEdit = { ...usuario };
  }

  guardarEdicion() {
    this.usuarioService.updateUsuario(this.usuarioEdit.id, this.usuarioEdit).subscribe({
      next: () => {
        this.editando = null;
        this.cargarUsuarios();
      },
      error: () => this.error = 'Error al editar usuario'
    });
  }

  cancelarEdicion() {
    this.editando = null;
    this.usuarioEdit = {};
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usuarioService.deleteUsuario(id).subscribe({
        next: () => this.cargarUsuarios(),
        error: () => this.error = 'Error al eliminar usuario'
      });
    }
  }
}
