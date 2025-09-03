  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';

  @Injectable({ providedIn: 'root' })
  export class AuthService {
    private apiUrl = 'http://localhost:8000/api'; // Cambia la URL si tu backend corre en otro puerto

    constructor(private http: HttpClient) {}

    login(email: string, password: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
    }

    register(data: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/auth/register`, data);
    }

    setToken(token: string) {
      localStorage.setItem('token', token);
    }

    getToken(): string | null {
      return localStorage.getItem('token');
    }

    logout() {
      localStorage.removeItem('token');
    }
  }
