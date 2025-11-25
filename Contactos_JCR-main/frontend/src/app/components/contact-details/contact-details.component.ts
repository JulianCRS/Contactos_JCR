import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contacto, Review } from '../../models/contacto.model'; // Importar Review del modelo
import { environment } from '../../../environments/environment';
import { ReviewsModalComponent } from '../reviews-modal/reviews-modal.component';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, ReviewsModalComponent],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent {
  @Input() contact!: Contacto;
  @Input() onClose: () => void = () => {};
  
  showReviews = false;
  reviews: Review[] = [];

  constructor(private contactService: ContactService) {}

  onShowReviews() {
    if (this.contact?.id) {
      this.contactService.getRatings(this.contact.id).subscribe({
        next: (ratings: Review[]) => {
          console.log('Reseñas cargadas:', ratings); // Debug
          this.reviews = ratings;
          this.showReviews = true;
        },
        error: (error) => {
          console.error('Error al cargar las reseñas:', error);
        }
      });
    }
  }

  onCloseReviews() {
    this.showReviews = false;
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    return imageUrl.startsWith('http') ?
      imageUrl :
      `${environment.apiUrl.replace('/api/contactos', '')}${imageUrl}`;
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/default-avatar.png';
  }
}
