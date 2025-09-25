import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const API = 'http://127.0.0.1:8000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(email: string, password: string) {
    // Tu API devuelve { usuario, token, token_type }
    return this.http.post<{ usuario: any; token: string; token_type: string }>(
      `${API}/auth/login`, { email, password }
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token); // sin "Bearer"
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
}
