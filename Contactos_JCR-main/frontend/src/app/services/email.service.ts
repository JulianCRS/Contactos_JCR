import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${environment.apiUrl}/send-email`; // Quitar la duplicación de /api/contactos

  constructor(private http: HttpClient) {}

  sendEmail(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}