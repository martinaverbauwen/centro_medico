import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

const API = 'http://127.0.0.1:8000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private user: any = null;
  private token: string | null = null;

  constructor() {
    // Cargar sesión desde localStorage al iniciar
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) this.user = JSON.parse(storedUser);
    if (storedToken) this.token = storedToken;
  }

  // -----------------------------
  // LOGIN
  // -----------------------------
  login(email: string, password: string): Observable<any> {
    return this.http.post<{ usuario: any; token: string; token_type: string }>(
      `${API}/auth/login`,
      { email, password }
    ).pipe(
      map((res) => {
        const user = this.normalizeUser(res.usuario);
        const token = res.token;

        // guardar en memoria y localStorage
        this.setUser(user);
        this.setToken(token);

        return user; // el componente recibe el user ya normalizado
      })
    );
  }

  // -----------------------------
  // REGISTER (por si lo usás)
  // -----------------------------
  register(data: any): Observable<any> {
    return this.http.post(`${API}/auth/register`, data);
  }

  // -----------------------------
  // SESIÓN / TOKEN
  // -----------------------------
  getUser(): any {
    if (!this.user) {
      const u = localStorage.getItem('user');
      this.user = u ? JSON.parse(u) : null;
    }
    return this.user;
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  setUser(user: any) {
    const u = this.normalizeUser(user);
    this.user = u;
    localStorage.setItem('user', JSON.stringify(u));
  }

  saveToken(token: string) { this.setToken(token); }
  saveUser(user: any)     { this.setUser(user); }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login');
  }

  // -----------------------------
  // ROLES
  // -----------------------------
  hasRole(role: string): boolean {
    const u = this.getUser();
    if (!u || !u.rol) return false;
    return String(u.rol).toLowerCase() === role.toLowerCase();
  }

  hasAnyRole(roles: string[]): boolean {
    const u = this.getUser();
    if (!u || !u.rol) return false;
    const rol = String(u.rol).toLowerCase();
    return roles.map(r => r.toLowerCase()).includes(rol);
  }

  // -----------------------------
  // NORMALIZAR USUARIO
  // -----------------------------
  private normalizeUser(u: any) {
    if (!u) return null;

    // intenta extraer el nombre del rol sin importar formato
    const rawRol =
      u?.rol?.nombre || u?.rol?.name ||
      u?.role?.nombre || u?.role?.name ||
      u?.rol || u?.role || '';

    const role = String(rawRol).toLowerCase().trim(); // 'medico', 'administrador', etc.

    const especialidad =
      u?.especialidad?.nombre ||
      u?.especialidad?.name ||
      u?.especialidad ||
      null;

    return {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido || '',
      email: u.email,
      rol: role,
      especialidad,
    };
  }
}
