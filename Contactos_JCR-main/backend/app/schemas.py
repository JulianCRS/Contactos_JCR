from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict
from typing import Optional, List
from .models import TipoContactoEnum, DetalleTipoEnum, TIPO_DETALLE_MAPPING
from datetime import datetime

# Clase base para Contacto
class ContactBase(BaseModel):
    nombre: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Nombre completo (2–50 caracteres)"
    )  # Validación de longitud mínima/máxima

    imagen: Optional[str] = None

    telefono: str = Field(
        ...,
        pattern=r'^\+?[0-9]{7,15}$',  # Cambié `regex` por `pattern`
        description="Teléfono (7-15 dígitos, puede incluir +)"
    )  # Validación por expresión regular

    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    lugar: Optional[str] = None
    tipo_contacto: Optional[TipoContactoEnum] = None
    tipo_contacto_otro: Optional[str] = None
    detalle_tipo: Optional[DetalleTipoEnum] = None
    detalle_tipo_otro: Optional[str] = None

    # Validadores modificados para ser más claros
    @validator('tipo_contacto')
    def validate_tipo_contacto(cls, v):
        if v and v not in [tipo.value for tipo in TipoContactoEnum]:
            raise ValueError(f"Tipo de contacto debe ser uno de: {', '.join([tipo.value for tipo in TipoContactoEnum])}")
        return v

    @validator('detalle_tipo')
    def validate_detalle_tipo(cls, v):
        if v and v not in [detalle.value for detalle in DetalleTipoEnum]:
            raise ValueError(f"Detalle de tipo debe ser uno de: {', '.join([detalle.value for detalle in DetalleTipoEnum])}")
        return v

    @validator('detalle_tipo_otro')
    def validate_detalle_tipo_otro(cls, v, values):
        if values.get('detalle_tipo') == DetalleTipoEnum.OTRO and not v:
            raise ValueError('detalle_tipo_otro es requerido cuando detalle_tipo es "Otro"')
        return v

    model_config = ConfigDict(from_attributes=True)  # Esto es clave para SQLAlchemy

# Clase para crear un nuevo contacto
class ContactCreate(ContactBase):
    pass

# Clase para actualizar un contacto (sin cambios respecto a ContactBase)
class ContactUpdate(ContactBase):
    pass

# Clase para representar un contacto en la base de datos
class ContactInDB(ContactBase):
    id: int
    owner_id: int
    average_rating: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

# Clase de paginación para los contactos
class PaginatedContacts(BaseModel):
    total: int               # Total de registros disponibles
    skip: int                # Cuántos registros se omitieron
    limit: int               # Tamaño de página solicitado
    data: List[ContactInDB]  # Lista de contactos paginados

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class RatingBase(BaseModel):
    categoria: str
    calificacion: int = Field(..., ge=1, le=5)
    comentario: str = Field(..., max_length=150)

class RatingCreate(RatingBase):
    pass

class RatingInDB(RatingBase):
    id: int
    contact_id: int
    fecha: datetime

    class Config:
        from_attributes = True

# Actualizar ContactResponse para incluir ratings
class ContactResponse(ContactBase):
    id: int
    average_rating: Optional[float] = None
    
    class Config:
        from_attributes = True
