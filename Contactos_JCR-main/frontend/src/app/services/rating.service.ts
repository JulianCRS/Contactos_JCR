import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private API = `${environment.apiUrl}/ratings`;

  constructor(private http: HttpClient) {}

  addRating(contactId: number, ratings: any[]): Observable<any> {
    return this.http.post(`${this.API}/${contactId}/ratings`, ratings).pipe(
      catchError(this.handleError)
    );
  }

  getRatings(contactId: number): Observable<any> {
    return this.http.get(`${this.API}/${contactId}`);
  }

  private handleError(error: any): Observable<never> {
    // Customize this method based on your error handling logic
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
}