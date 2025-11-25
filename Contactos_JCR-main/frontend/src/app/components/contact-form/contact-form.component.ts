// src/app/components/contact-form/contact-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { Contacto, TipoContacto, DetalleTipo } from '../../models/contacto.model';
import { Nl2brPipe } from '../../pipes/nl2br.pipe';
import { environment } from '../../../environments/environment'; // Corregir esta línea


@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Nl2brPipe
  ],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css']
})
export class ContactFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditing = false;
  contactId?: number;
  imagePreview: string | null = null;
  hasExistingImage: boolean = false;
  imageError: string | null = null;
  selectedFile: File | null = null;

  tipoContactoOptions = [
    'Proveedor', 'Cliente', 'Empleado', 'Externo',
    'Socio', 'Aliado', 'Otro'
  ];

  detalleTipoMapping: { [key: string]: string[] } = {
    'Proveedor': ['Mercancía', 'Servicios', 'Software', 'Insumos', 'Logística'],
    'Cliente': ['Corporativo', 'Persona natural', 'Frecuente', 'Potencial'],
    'Empleado': ['Administrativo', 'Operativo', 'Freelance', 'Temporal'],
    'Externo': ['Consultor', 'Auditor', 'Contratista', 'Técnico'],
    'Socio': ['Inversionista', 'Co-fundador', 'Representante legal'],
    'Aliado': ['ONG', 'Entidad pública', 'Cámara de comercio', 'Universidad'],
    'Otro': ['Otro']
  };

  @Input() contacto?: Contacto;             // recibe datos del padre :contentReference[oaicite:0]{index=0}
  @Output() saved = new EventEmitter<void>(); // emite evento al padre :contentReference[oaicite:1]{index=1}

  constructor(
    private fb: FormBuilder,
    private service: ContactService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      email: ['', [Validators.email]],
      direccion: [''],
      lugar: [''],
      tipo_contacto: [''],
      tipo_contacto_otro: [''],
      detalle_tipo: [''],
      detalle_tipo_otro: ['']
    });

    // Observar cambios en tipo_contacto
    this.form.get('tipo_contacto')?.valueChanges.subscribe(value => {
      const detalleTipoControl = this.form.get('detalle_tipo');
      detalleTipoControl?.setValue('');

      if (value === 'Otro') {
        this.form.get('tipo_contacto_otro')?.setValidators([Validators.required]);
      } else {
        this.form.get('tipo_contacto_otro')?.clearValidators();
      }
      this.form.get('tipo_contacto_otro')?.updateValueAndValidity();
    });

    // Observar cambios en detalle_tipo
    this.form.get('detalle_tipo')?.valueChanges.subscribe(value => {
      if (value === 'Otro') {
        this.form.get('detalle_tipo_otro')?.setValidators([Validators.required]);
      } else {
        this.form.get('detalle_tipo_otro')?.clearValidators();
      }
      this.form.get('detalle_tipo_otro')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Obtener el ID del contacto de la URL si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.contactId = +id;
      this.loadContact(this.contactId);
    } else if (this.contacto) {
      this.form.patchValue(this.contacto);
    }
  }

  loadContact(id: number) {
    this.service.getContact(id).subscribe({
      next: (contacto: Contacto) => {
        this.form.patchValue(contacto);
        if (contacto.imagen) {
          this.hasExistingImage = true;
          // Construir la URL completa de la imagen
          this.imagePreview = `${environment.apiUrl.replace('/api/contactos', '')}${contacto.imagen}`;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar el contacto:', error);
        this.errorMessage = 'Error al cargar el contacto';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|png|gif|bmp|webp)/)) {
        this.imageError = 'El archivo debe ser una imagen (JPG, PNG, GIF, BMP, WEBP)';
        return;
      }

      this.selectedFile = file;
      this.imageError = null;

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.hasExistingImage = true;
      };
      reader.onerror = () => {
        this.imageError = 'Error al leer el archivo';
      };
      reader.readAsDataURL(file);
    }
  }

  getDetalleTipoOptions(tipoContacto: string): string[] {
    return this.detalleTipoMapping[tipoContacto] || [];
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formData = new FormData();

      // Agregar todos los campos del formulario
      Object.keys(this.form.controls).forEach(key => {
        const value = this.form.get(key)?.value;
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      // Agregar la imagen si existe
      if (this.selectedFile) {
        formData.append('imagen', this.selectedFile);
      }

      const request$ = this.isEditing
        ? this.service.update(this.contactId!, formData)
        : this.service.create(formData);

      request$.subscribe({
        next: (response) => {
          console.log('Contacto guardado:', response);
          this.successMessage = `Contacto ${this.isEditing ? 'actualizado' : 'creado'} exitosamente`;
          this.loading = false;
          this.saved.emit();
          setTimeout(() => this.router.navigate(['/contactos']), 1500);
        },
        error: (error) => {
          console.error('Error:', error);
          this.errorMessage = error;
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos requeridos correctamente';
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/contactos']);
  }
}
