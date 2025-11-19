import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:8000/api/usuarios';

  constructor(private http: HttpClient) {}

  // --------- USUARIOS GENERALES (ya lo tenías) ---------
  getUsuarios(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  createUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  updateUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // --------- MÉDICOS (NUEVO) ---------

  /** Lista SOLO médicos usando ?rol=medico */
  getMedicos(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?rol=medico`).pipe(
      map(res => res.data)
    );
  }

  /** Crea un médico forzando rol = "medico" */
  createMedico(medico: any): Observable<any> {
    const payload = {
      ...medico,
      rol: 'medico',  // se mapea a rol_id en el backend
    };
    // nos aseguramos de no mandar rol_id directo desde el form
    delete (payload as any).rol_id;

    return this.http.post(this.apiUrl, payload);
  }

  /** Actualiza un médico, manteniendo el rol = "medico" */
  updateMedico(id: number, medico: any): Observable<any> {
    const payload = {
      ...medico,
      rol: 'medico',
    };
    delete (payload as any).rol_id;

    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  /** Eliminar médico (igual que eliminar usuario) */
  deleteMedico(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getEspecialidades(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:8000/api/especialidades');
}

}
