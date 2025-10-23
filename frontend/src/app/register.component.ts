import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    password_confirmation: '',   // <-- NUEVO
    dni: '',
    telefono: '',
    rol: 'paciente'              // <-- ahora en minúscula
  };

  especialidades: any[] = [];
  loading = false;
  success = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.getEspecialidades();
  }

  getEspecialidades() {
    this.http.get<any[]>('http://localhost:8000/api/especialidades').subscribe({
      next: (data) => this.especialidades = data,
      error: () => this.especialidades = []
    });
  }

  register() {
    this.loading = true;
    this.error = '';

    // Armamos el payload explícito para evitar mandar null/undefined no deseados
    const payload: any = {
      nombre: this.form.nombre,
      apellido: this.form.apellido || undefined,
      email: this.form.email,
      password: this.form.password,
      password_confirmation: this.form.password_confirmation, // <-- CLAVE
      dni: this.form.dni || undefined,
      telefono: this.form.telefono || undefined,
      rol: (this.form.rol || 'paciente').toLowerCase()        // asegurar minúscula
      // especialidad_id: solo si en algún momento registrás médicos
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        // Mostrar mensaje del backend si viene
        this.error = err?.error?.message
          || (err?.error?.errors ? JSON.stringify(err.error.errors) : 'Error en el registro');
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
