import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface AuthResponse {
  access_token: string;
  token_type: string;
  username: string;
}

interface UserData {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = environment.authUrl;
  private userSubject = new BehaviorSubject<UserData | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  signup(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/signup`, credentials);
    // Removemos el tap() para que no guarde los datos automáticamente
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        const userData: UserData = {
          token: response.access_token,
          username: response.username
        };
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        this.userSubject.next(userData);
      })
    );
  }

  checkAndRestoreSession() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      this.clearSession();
      this.router.navigate(['/login']);
      return;
    }

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(tokenData.exp * 1000);

      if (expirationDate < new Date()) {
        this.clearSession();
        this.router.navigate(['/login']);
      } else {
        // Restaurar la sesión si el token es válido
        this.userSubject.next(JSON.parse(userData));
      }
    } catch {
      this.clearSession();
      this.router.navigate(['/login']);
    }
  }

  private clearSession() {
    localStorage.clear();
    this.userSubject.next(null);
  }

  logout() {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return new Date(tokenData.exp * 1000) > new Date();
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
