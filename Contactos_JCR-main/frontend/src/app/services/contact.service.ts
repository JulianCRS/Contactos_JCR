import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, map, concatMap } from 'rxjs/operators';
import { Contacto, Rating, Review } from '../models/contacto.model';
import { environment } from '../../environments/environment';

type ErrorType = 'defaultError' | 'validation' | 'notFound' | 'unauthorized' | 'serverError';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private API = environment.apiUrl;

  // Definir los mensajes de error como propiedad de la clase
  private errorMessages = {
    defaultError: 'Ha ocurrido un error inesperado',
    validation: 'Error de validación',
    notFound: 'El recurso solicitado no existe',
    unauthorized: 'No autorizado',
    serverError: 'Error del servidor'
  };

  constructor(private http: HttpClient) {}

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = error.error.message;
    } else {
      // Error del servidor
      const errorData = error.error;

      if (errorData?.errors) {
        // Múltiples errores de validación
        errorMessage = errorData.errors
          .map((e: any) => {
            const fieldName = this.getFieldDisplayName(e.loc[e.loc.length - 1]);
            return `${fieldName}: ${e.msg}`;
          })
          .join('\n');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else {
        const errorType = (errorData?.type as ErrorType) || 'defaultError';
        errorMessage = this.errorMessages[errorType] || this.errorMessages.defaultError;
      }
    }

    console.error('Error:', error);
    return throwError(() => errorMessage);
  }

  private formatCSVField(value: any): string {
    if (value === null || value === undefined) return '';

    // Convertir a string y escapar comillas dobles
    const stringValue = value.toString();

    // Si el valor contiene punto y coma o saltos de línea, encerrarlo en comillas
    if (stringValue.includes(';') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      nombre: 'Nombre',
      telefono: 'Teléfono',
      email: 'Email',
      direccion: 'Dirección',
      lugar: 'Lugar',
      tipo_contacto: 'Tipo de contacto',
      detalle_tipo: 'Detalle del tipo',
      tipo_contacto_otro: 'Otro tipo de contacto',
      detalle_tipo_otro: 'Otro detalle del tipo',
      imagen: 'Imagen'
    };
    return fieldNames[field] || field;
  }

  create(contactData: FormData): Observable<Contacto> {
    return this.http.post<Contacto>(this.API, contactData)
      .pipe(catchError(this.handleError));
  }

  update(id: number, contactData: FormData): Observable<Contacto> {
    return this.http.put<Contacto>(`${this.API}/${id}`, contactData)
      .pipe(catchError(this.handleError));
  }

  getAll(): Observable<Contacto[]> {
    return this.http.get<{data: Contacto[]}>(this.API).pipe(
      map(response => {
        console.log('Respuesta del servidor:', response); // Debug
        return response.data.map(contact => ({
          ...contact,
          averageRating: contact.average_rating
        }));
      }),
      catchError(this.handleError)
    );
  }

  // Eliminar el método getById y reemplazarlo por getContact
  getContact(id: number): Observable<Contacto> {
    return this.http.get<Contacto>(`${this.API}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`).pipe(
        catchError(error => {
            console.error('Error al eliminar contacto:', error);
            let errorMessage = 'Error al eliminar el contacto';

            if (error.error?.message) {
                errorMessage = error.error.message;
            }

            return throwError(() => errorMessage);
        })
    );
  }

  exportToCSV(contacts: Contacto[]): void {
    if (contacts.length === 0) {
      throw new Error('No hay contactos para exportar');
    }

    try {
      // Headers actualizados con todos los campos
      const headers = [
        'ID',
        'Nombre',
        'Teléfono',
        'Email',
        'Dirección',
        'Lugar',
        'Tipo de Contacto',
        'Tipo de Contacto (Otro)',
        'Detalle del Tipo',
        'Detalle del Tipo (Otro)',
        'Calificación Promedio'
      ];

      // Datos actualizados incluyendo todos los campos
      const csvData = contacts.map(contact => [
        this.formatCSVField(contact.id),
        this.formatCSVField(contact.nombre),
        this.formatCSVField(contact.telefono),
        this.formatCSVField(contact.email),
        this.formatCSVField(contact.direccion),
        this.formatCSVField(contact.lugar),
        this.formatCSVField(contact.tipo_contacto),
        this.formatCSVField(contact.tipo_contacto_otro),
        this.formatCSVField(contact.detalle_tipo),
        this.formatCSVField(contact.detalle_tipo_otro),
        this.formatCSVField(contact.averageRating ? contact.averageRating.toFixed(1) : '')
      ]);

      // Crear el contenido del CSV
      let csvContent = headers.join(';') + '\n';
      csvContent += csvData.map(row => row.join(';')).join('\n');

      // Agregar BOM para que Excel reconozca el UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });

      // Crear el enlace de descarga
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      // Configurar el nombre del archivo con fecha
      const date = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
      const filename = `contactos_${date}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error al generar CSV:', error);
      throw new Error('Error al generar el archivo CSV');
    }
  }

  addRating(contactId: number, ratings: any[]): Observable<any> {
    return this.http.post(`${this.API}/${contactId}/ratings`, ratings).pipe(
      catchError(this.handleError)
    );
  }

  getRatings(contactId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API}/${contactId}/ratings`);
  }

  importFromCSV(file: File): Observable<any> {
    return new Observable((observer) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const contacts = this.parseCSV(text);

          // Crear un observable para procesar cada contacto
          const importObservable = from(contacts).pipe(
            concatMap(contact => {
              const formData = new FormData();
              Object.keys(contact).forEach(key => {
                if (contact[key] !== undefined && contact[key] !== null) {
                  formData.append(key, contact[key]);
                }
              });
              return this.create(formData);
            })
          );

          // Suscribirse al observable de importación
          importObservable.subscribe({
            next: (response) => {
              observer.next(response);
            },
            error: (error) => {
              observer.error(error);
            },
            complete: () => {
              observer.complete();
            }
          });
        } catch (error) {
          observer.error('Error al procesar el archivo CSV');
        }
      };

      reader.onerror = () => {
        observer.error('Error al leer el archivo');
      };

      reader.readAsText(file);
    });
  }

  private parseCSV(csvText: string): any[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(';').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(';').map(v => v.trim());
      const obj: any = {};

      headers.forEach((header, index) => {
        let key = this.mapHeaderToField(header);
        if (key && values[index]) {
          obj[key] = values[index].replace(/^"(.*)"$/, '$1'); // Remover comillas
        }
      });

      if (Object.keys(obj).length > 0) {
        result.push(obj);
      }
    }

    return result;
  }

  private mapHeaderToField(header: string): string | null {
    const mapping: { [key: string]: string } = {
      'ID': 'id',
      'Nombre': 'nombre',
      'Teléfono': 'telefono',
      'Email': 'email',
      'Dirección': 'direccion',
      'Lugar': 'lugar',
      'Tipo de Contacto': 'tipo_contacto',
      'Tipo de Contacto (Otro)': 'tipo_contacto_otro',
      'Detalle del Tipo': 'detalle_tipo',
      'Detalle del Tipo (Otro)': 'detalle_tipo_otro'
    };
    return mapping[header] || null;
  }
}
