// src/app/core/services/turnos.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Turno {
  id?: number;
  fecha: string; hora: string;
  paciente_id: number; medico_id: number; especialidad_id: number;
}

const API = 'http://127.0.0.1:8000/api'; // <-- cambiá 8000 si tu backend corre en otro puerto

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private http = inject(HttpClient);
  private base = `${API}/turnos`;

  list(filter?: { fecha?: string; medico_id?: number; paciente_id?: number }): Observable<Turno[]> {
    let params = new HttpParams();
    if (filter?.fecha) params = params.set('fecha', filter.fecha);
    if (filter?.medico_id) params = params.set('medico_id', filter.medico_id);
    if (filter?.paciente_id) params = params.set('paciente_id', filter.paciente_id);
    return this.http.get<Turno[]>(this.base, { params });
  }
  get(id: number) { return this.http.get<Turno>(`${this.base}/${id}`); }
  create(data: Turno) { return this.http.post<Turno>(this.base, data); }
  update(id: number, data: Partial<Turno>) { return this.http.put<Turno>(`${this.base}/${id}`, data); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
