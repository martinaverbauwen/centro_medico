// src/app/especialidad.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private apiUrl = 'http://localhost:8000/api/especialidades';

  constructor(private http: HttpClient) {}

  getEspecialidades(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => Array.isArray(res) ? res : (res?.data ?? res ?? []))
    );
  }

  createEspecialidad(data: { nombre: string; descripcion?: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateEspecialidad(id: number, data: { nombre?: string; descripcion?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteEspecialidad(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
