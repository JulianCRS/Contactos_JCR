import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Contacto } from '../../models/contacto.model';
import { RatingComponent } from '../rating/rating.component';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RatingComponent],
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.css']
})
export class RatingModalComponent implements OnInit {
  @Input() contact!: Contacto;
  @Output() close = new EventEmitter<void>();
  @Output() rated = new EventEmitter<any>();

  ratingForm: FormGroup;
  categoriasEvaluacion: string[] = [];
  loading = false;

  constructor(private fb: FormBuilder) {
    this.ratingForm = this.fb.group({
      comentario: ['', [Validators.required, Validators.maxLength(150)]]
    });
  }

  ngOnInit() {
    this.categoriasEvaluacion = this.getCategoriasByTipoContacto(this.contact.tipo_contacto || '');
    this.initializeRatingForm();
  }

  private initializeRatingForm() {
    this.categoriasEvaluacion.forEach(categoria => {
      this.ratingForm.addControl(categoria, this.fb.control(0, [Validators.required, Validators.min(1)]));
    });
  }

  onSubmit() {
    if (this.ratingForm.valid) {
      this.loading = true;
      const ratings = this.categoriasEvaluacion.map(categoria => ({
        categoria,
        calificacion: this.ratingForm.get(categoria)?.value,
        comentario: this.ratingForm.get('comentario')?.value
      }));
      this.rated.emit(ratings);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.ratingForm.controls).forEach(key => {
        const control = this.ratingForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onClose() {
    this.close.emit();
  }

  onRating(categoria: string, value: number) {
    this.ratingForm.get(categoria)?.setValue(value);
    this.ratingForm.get(categoria)?.markAsTouched();
  }

  private getCategoriasByTipoContacto(tipo: string): string[] {
    const categoriasMap: { [key: string]: string[] } = {
      'Proveedor': [
        'Confiabilidad',
        'Calidad del producto o servicio',
        'Precio / beneficio',
        'Puntualidad en las entregas',
        'Soporte postventa',
        'Comunicación'
      ],
      'Cliente': [
        'Facilidad de trato',
        'Nivel de compras / recurrencia',
        'Potencial de fidelización',
        'Comunicación',
        'Cumplimiento de pagos',
        'Nivel de satisfacción general'
      ],
      'Empleado': [
        'Puntualidad',
        'Productividad',
        'Actitud / colaboración',
        'Adaptabilidad',
        'Calidad del trabajo',
        'Cumplimiento de objetivos'
      ],
      'Externo': [
        'Profesionalismo',
        'Calidad técnica',
        'Confidencialidad',
        'Puntualidad',
        'Valor estratégico',
        'Facilidad de coordinación'
      ],
      'Socio': [
        'Nivel de compromiso',
        'Transparencia',
        'Aporte económico / estratégico',
        'Confianza',
        'Cumplimiento de acuerdos',
        'Visión compartida'
      ],
      'Aliado': [
        'Interés mutuo',
        'Alineación institucional',
        'Beneficio para ambas partes',
        'Calidad de colaboración',
        'Nivel de participación',
        'Comunicación'
      ],
      'Otro': [
        'Relación general',
        'Nivel de interacción',
        'Potencial utilidad futura',
        'Imagen profesional',
        'Claridad en la comunicación'
      ]
    };
    return categoriasMap[tipo] || ['Relación general'];
  }
}
