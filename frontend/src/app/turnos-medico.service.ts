import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TurnosMedicoService {
  private apiUrl = 'http://127.0.0.1:8000/api/turnos';

  constructor(private http: HttpClient) {}

  // Si ya tenés un HTTP interceptor que agrega el token, podés quitar esto y los { headers: ... }
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  /**
   * Trae turnos del médico logueado en un rango.
   * El backend ya limita por médico si el rol es "medico".
   * Si querés forzar un médico puntual, descomenta el set('medico_id', 'X').
   */
  getTurnosRango(desde: string, hasta: string): Observable<any[]> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('per_page', '500');
      // .set('medico_id', '6'); // opcional si necesitás forzar

    return this.http.get<any>(this.apiUrl, { headers: this.authHeaders(), params })
      .pipe(map(res => Array.isArray(res) ? res : (res?.data ?? [])));
  }

  /**
   * Compatibilidad: obtener turnos sin rango (no recomendado para vistas grandes).
   * Mantengo este método si ya lo usabas en alguna otra parte.
   */
  getTurnos(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.authHeaders() })
      .pipe(map(response => Array.isArray(response) ? response : (response?.data ?? [])));
  }

  /**
   * Crear/agendar turno.
   */
  agendarTurno(turno: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, turno, { headers: this.authHeaders() });
  }
}
