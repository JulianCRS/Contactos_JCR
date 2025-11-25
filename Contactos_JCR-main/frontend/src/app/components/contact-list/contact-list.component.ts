import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { ContactFilterComponent } from '../contact-filter/contact-filter.component';
import { RatingComponent } from '../rating/rating.component';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { RatingModalComponent } from '../rating-modal/rating-modal.component';
import { Contacto } from '../../models/contacto.model';
import { FilterCriteria } from '../contact-filter/contact-filter.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ContactFilterComponent,
    RatingComponent,
    ContactDetailsComponent,
    RatingModalComponent
  ],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {
  contacts: Contacto[] = [];
  filteredContacts: Contacto[] = [];
  selectedContact?: Contacto;
  showDetails = false;
  isRatingModalOpen = false;
  showFilters = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private service: ContactService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.service.getAll().subscribe({
      next: (contacts: Contacto[]) => {
        console.log('Contactos recibidos con ratings:', contacts);
        this.contacts = contacts;
        this.filteredContacts = contacts;
      },
      error: (error) => {
        console.error('Error al cargar contactos:', error);
        this.showErrorNotification('Error al cargar los contactos');
      }
    });
  }

  onDelete(id: number) {
    const confirmation = confirm('¿Estás seguro que deseas eliminar este contacto? Esta acción no se puede deshacer.');
    if (confirmation) {
      this.service.delete(id).subscribe({
        next: () => {
          this.loadContacts();
          this.showSuccessNotification('Contacto eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar el contacto:', error);
          this.showErrorNotification('Error al eliminar el contacto');
        }
      });
    }
  }

  onEdit(id: number) {
    this.router.navigate(['/contactos/editar', id]);
  }

  onSearch(term: string) {
    if (!term) {
      this.filteredContacts = this.contacts;
    } else {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.nombre.toLowerCase().includes(term.toLowerCase()) ||
        contact.email?.toLowerCase().includes(term.toLowerCase()) ||
        contact.telefono.toLowerCase().includes(term.toLowerCase())
      );
    }
  }

  onFilterChange(criteria: FilterCriteria) {
    this.filteredContacts = this.contacts.filter(contact => {
      const matchesSearch = !criteria.searchTerm ||
        contact.nombre.toLowerCase().includes(criteria.searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(criteria.searchTerm.toLowerCase()) ||
        contact.telefono.toLowerCase().includes(criteria.searchTerm.toLowerCase());

      const matchesTipoContacto = !criteria.tipoContacto ||
        contact.tipo_contacto === criteria.tipoContacto;

      const matchesDetalleTipo = !criteria.detalleTipo ||
        contact.detalle_tipo === criteria.detalleTipo;

      return matchesSearch && matchesTipoContacto && matchesDetalleTipo;
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  onOpen(id: number) {
    const contact = this.contacts.find(c => c.id === id);
    if (contact) {
      this.selectedContact = contact;
      this.showDetails = true;
    }
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedContact = undefined;
  }

  downloadCSV(): void {
    if (this.filteredContacts.length === 0) {
      this.showErrorNotification('No hay contactos para exportar');
      return;
    }

    try {
      this.service.exportToCSV(this.filteredContacts);
      this.showSuccessNotification('¡Descarga completada!');
    } catch (error) {
      console.error('Error al exportar contactos:', error);
      this.showErrorNotification('Error al descargar el archivo CSV');
    }
  }

  showRatingModal(contact: Contacto) {
    this.selectedContact = contact;
    this.isRatingModalOpen = true;
  }

  onRated(ratings: any[]) {
    if (this.selectedContact) {
      this.service.addRating(this.selectedContact.id!, ratings).subscribe({
        next: () => {
          this.isRatingModalOpen = false;
          this.loadContacts(); // Recargar todos los contactos
          this.showSuccessNotification('Calificación guardada correctamente');
        },
        error: (error: Error) => {
          console.error('Error al guardar la calificación:', error);
          this.showErrorNotification('Error al guardar la calificación');
        }
      });
    }
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      this.showErrorNotification('Por favor, selecciona un archivo CSV válido');
      return;
    }

    try {
      this.service.importFromCSV(file).subscribe({
        next: () => {
          this.loadContacts();
          this.showSuccessNotification('Contactos importados correctamente');
        },
        error: (error) => {
          console.error('Error al importar contactos:', error);
          this.showErrorNotification('Error al importar los contactos');
        }
      });
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      this.showErrorNotification('Error al procesar el archivo CSV');
    }
  }

  private showErrorNotification(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  }

  private showSuccessNotification(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}
