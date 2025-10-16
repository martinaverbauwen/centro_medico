import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TurnosMedicoService {
  private apiUrl = 'http://localhost:8000/api/turnos';

  constructor(private http: HttpClient) {}

  getTurnos(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }


  agendarTurno(turno: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, turno);
  }


  // Métodos de edición y borrado eliminados
}
