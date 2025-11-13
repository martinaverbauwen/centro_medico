import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';

    this.auth.login(this.email, this.password).subscribe({
      // el servicio devuelve el usuario normalizado
      next: (user) => {
        console.log('Usuario logueado:', user);

        // siempre ir a la página principal
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error login:', err);
        this.error = err.error?.message || 'Error de autenticación';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
