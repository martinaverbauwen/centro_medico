import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <form [formGroup]="form" (ngSubmit)="onSubmit()" style="max-width:360px;margin:2rem auto;display:grid;gap:.75rem;">
    <h3>Iniciar sesión</h3>
    <input type="email" placeholder="Email" formControlName="email">
    <input type="password" placeholder="Password" formControlName="password">
    <button [disabled]="form.invalid || loading">Ingresar</button>
    <small *ngIf="error" style="color:#c00">{{error}}</small>
  </form>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    const { email, password } = this.form.value as { email: string; password: string };

    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token);      // <-- guarda el token (tu API lo manda en "token")
        this.router.navigateByUrl('/agenda'); // <-- redirige a la Agenda
      },
      error: (e) => {
        this.error = e?.error?.message || 'Credenciales inválidas';
        this.loading = false;
      }
    });
  }
}
