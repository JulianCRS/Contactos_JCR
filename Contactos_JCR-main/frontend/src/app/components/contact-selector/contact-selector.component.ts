import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service';
import { Contacto } from '../../models/contacto.model';
import { FormsModule } from '@angular/forms';
import { ContactFilterComponent } from '../contact-filter/contact-filter.component';

@Component({
  selector: 'app-contact-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, ContactFilterComponent],
  templateUrl: './contact-selector.component.html',
  styleUrls: ['./contact-selector.component.css']
})
export class ContactSelectorComponent {
  contacts: Contacto[] = [];
  filteredContacts: Contacto[] = [];
  @Output() recipientSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  constructor(private contactService: ContactService) {
    this.loadContacts();
  }

  loadContacts() {
    this.contactService.getAll().subscribe({
      next: (contacts) => {
        this.contacts = contacts.filter(c => c.email); // Solo contactos con email
        this.filteredContacts = this.contacts;
      },
      error: (error) => console.error('Error cargando contactos:', error)
    });
  }

  onFilterChange(criteria: any) {
    this.filteredContacts = this.contacts.filter(contact => {
      const matchesSearch = !criteria.searchTerm ||
        contact.nombre.toLowerCase().includes(criteria.searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(criteria.searchTerm.toLowerCase());

      const matchesTipoContacto = !criteria.tipoContacto ||
        contact.tipo_contacto === criteria.tipoContacto;

      const matchesDetalleTipo = !criteria.detalleTipo ||
        contact.detalle_tipo === criteria.detalleTipo;

      return matchesSearch && matchesTipoContacto && matchesDetalleTipo;
    });
  }

  onAdd(contact: Contacto) {
    if (contact.email) {
      this.recipientSelected.emit(contact.email);
    }
  }

  onClose() {
    this.close.emit();
  }
}
