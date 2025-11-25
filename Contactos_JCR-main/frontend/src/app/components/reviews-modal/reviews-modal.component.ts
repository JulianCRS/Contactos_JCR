import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contacto, Review } from '../../models/contacto.model';
import { RatingComponent } from '../rating/rating.component';

interface GroupedRating {
  fecha: Date;
  calificacionPromedio: number;
  comentario: string;
}

@Component({
  selector: 'app-reviews-modal',
  standalone: true,
  imports: [CommonModule, RatingComponent],
  templateUrl: './reviews-modal.component.html',
  styleUrls: ['./reviews-modal.component.css']
})
export class ReviewsModalComponent implements OnInit {
  @Input() contact!: Contacto;
  @Input() set reviews(value: Review[]) {
    if (value) {
      this.processReviews(value);
    }
  }
  @Output() close = new EventEmitter<void>();

  groupedReviews: GroupedRating[] = [];

  ngOnInit() {
    if (this.reviews?.length > 0) {
      this.processReviews(this.reviews);
    }
  }

  private processReviews(reviews: Review[]) {
    // Agrupar por fecha exacta (mismo timestamp = misma sesión de calificación)
    const reviewsBySession = new Map<string, Review[]>();
    
    reviews.forEach(review => {
      // Usar solo la fecha sin la hora para agrupar las calificaciones del mismo momento
      const dateKey = new Date(review.fecha).toISOString().split('.')[0];
      if (!reviewsBySession.has(dateKey)) {
        reviewsBySession.set(dateKey, []);
      }
      reviewsBySession.get(dateKey)?.push(review);
    });

    // Procesar cada sesión de calificación
    this.groupedReviews = Array.from(reviewsBySession.entries()).map(([dateKey, sessionReviews]) => {
      // Calcular el promedio de todas las categorías evaluadas en esta sesión
      const totalScore = sessionReviews.reduce((sum, r) => sum + r.calificacion, 0);
      const averageScore = totalScore / sessionReviews.length;
      
      // Tomar el comentario y fecha de cualquier review del grupo (son iguales)
      return {
        fecha: new Date(sessionReviews[0].fecha),
        calificacionPromedio: averageScore,
        comentario: sessionReviews[0].comentario // El comentario es el mismo para todos los items
      };
    });

    // Ordenar por fecha descendente (más reciente primero)
    this.groupedReviews.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  onClose() {
    this.close.emit();
  }
}
