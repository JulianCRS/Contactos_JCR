export type Parentesco = 'Familiar' | 'Amoroso' | 'Amistad' | 'Laboral' | 'Educativo' | 'Otro';
export type Categoria = 'Personal' | 'Profesional' | 'Educativo' | 'Social' | 'Salud' | 'Financiero' | 'Emergencia' | 'Otro';
export type TipoContacto = 'Proveedor' | 'Cliente' | 'Empleado' | 'Externo' | 'Socio' | 'Aliado' | 'Otro';

export type DetalleTipo = 'Mercancía' | 'Servicios' | 'Software' | 'Insumos' | 'Logística' |
                         'Corporativo' | 'Persona natural' | 'Frecuente' | 'Potencial' |
                         'Administrativo' | 'Operativo' | 'Freelance' | 'Temporal' |
                         'Consultor' | 'Auditor' | 'Contratista' | 'Técnico' |
                         'Inversionista' | 'Co-fundador' | 'Representante legal' |
                         'ONG' | 'Entidad pública' | 'Cámara de comercio' | 'Universidad' | 'Otro';

export interface Contacto {
    id?: number;
    nombre: string;
    telefono: string;
    email?: string;
    direccion?: string;
    lugar?: string;
    tipo_contacto?: string;
    tipo_contacto_otro?: string;
    detalle_tipo?: string;
    detalle_tipo_otro?: string;
    imagen?: string;
    averageRating?: number;
    average_rating?: number;
}

export interface Rating {
    id?: number;
    contactId: number;
    categoria: string;
    calificacion: number;
    comentario: string;
    fecha: Date;
}

// Añadir la interfaz Review
export interface Review {
    id?: number;
    contactId: number;
    categoria: string;
    calificacion: number;
    comentario: string;
    fecha: Date;
}

export interface FilterCriteria {
    searchTerm: string;
    tipoContacto: TipoContacto | '';
    detalleTipo: DetalleTipo | '';
}
