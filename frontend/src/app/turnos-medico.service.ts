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
   * Trae turnos en un rango.
   * - Si el usuario logueado es MÉDICO, el backend ya filtra por ese médico.
   * - Si es ADMIN/SECRETARIO y pasás medicoId, filtra por ese médico.
   */
  getTurnosRango(desde: string, hasta: string, medicoId?: number): Observable<any[]> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('per_page', '500');

    if (medicoId) {
      params = params.set('medico_id', medicoId.toString());
    }

    return this.http.get<any>(this.apiUrl, { headers: this.authHeaders(), params })
      .pipe(map(res => Array.isArray(res) ? res : (res?.data ?? [])));
  }

  /**
   * Compatibilidad: obtener turnos sin rango (no recomendado para vistas grandes).
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

  /**
   * Cancelar turno (cambiar estado a 'cancelado').
   */
  cancelarTurno(turnoId: number): Observable<any> {
    const data = { estado: 'cancelado' };
    return this.http.put<any>(`${this.apiUrl}/${turnoId}`, data, { headers: this.authHeaders() });
  }

  /**
   * Eliminar turno definitivamente.
   */
  eliminarTurno(turnoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${turnoId}`, { headers: this.authHeaders() });
  }

  reprogramarTurno(id: number, data: { fecha: string; hora: string }) {
    return this.http.put(`${this.apiUrl}/${id}/reprogramar`, data, { headers: this.authHeaders() });
  }
}
