import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgendarTurnoService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // ajustá si tu backend usa otro host/puerto

  constructor(private http: HttpClient) {}

  // Si ya usás un interceptor para el token, podés quitar esto y el { headers: ... } de las llamadas
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  // Ahora pegamos a /api/medicos (accesible a paciente autenticado)
  getMedicos(especialidad_id?: number): Observable<any[]> {
    const url = especialidad_id
      ? `${this.apiUrl}/medicos?especialidad_id=${especialidad_id}`
      : `${this.apiUrl}/medicos`;
    return this.http.get<any[]>(url, { headers: this.authHeaders() });
  }

  getEspecialidades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/especialidades`, { headers: this.authHeaders() });
  }
}
