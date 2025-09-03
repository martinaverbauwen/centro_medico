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
    dni: '',
    telefono: '',
  rol: 'Paciente'
  };
  especialidades: any[] = [];
  // roles eliminados, solo se registra como cliente
  loading = false;
  success = false;
  error = '';

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) {
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
    this.auth.register(this.form).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error en el registro';
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
