import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoContacto, DetalleTipo } from '../../models/contacto.model';

export interface FilterCriteria {
  searchTerm: string;
  tipoContacto: TipoContacto | '';
  detalleTipo: DetalleTipo | '';
}

@Component({
  selector: 'app-contact-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './contact-filter.component.html',
  styleUrls: ['./contact-filter.component.css']
})
export class ContactFilterComponent {
  searchTerm: string = '';
  selectedTipoContacto: TipoContacto | '' = '';
  selectedDetalleTipo: DetalleTipo | '' = '';

  tipoContactoOptions: TipoContacto[] = [
    'Proveedor', 'Cliente', 'Empleado', 'Externo', 'Socio', 'Aliado', 'Otro'
  ];

  detalleTipoMapping: { [key in TipoContacto]: DetalleTipo[] } = {
    'Proveedor': ['Mercancía', 'Servicios', 'Software', 'Insumos', 'Logística'],
    'Cliente': ['Corporativo', 'Persona natural', 'Frecuente', 'Potencial'],
    'Empleado': ['Administrativo', 'Operativo', 'Freelance', 'Temporal'],
    'Externo': ['Consultor', 'Auditor', 'Contratista', 'Técnico'],
    'Socio': ['Inversionista', 'Co-fundador', 'Representante legal'],
    'Aliado': ['ONG', 'Entidad pública', 'Cámara de comercio', 'Universidad'],
    'Otro': ['Otro']
  };

  @Output() filterChange = new EventEmitter<FilterCriteria>();

  isFiltering(): boolean {
    return this.searchTerm !== '' ||
           this.selectedTipoContacto !== '' ||
           this.selectedDetalleTipo !== '';
  }

  onFilterChange() {
    this.filterChange.emit({
      searchTerm: this.searchTerm,
      tipoContacto: this.selectedTipoContacto,
      detalleTipo: this.selectedDetalleTipo
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedTipoContacto = '';
    this.selectedDetalleTipo = '';
    this.onFilterChange();
  }
}
