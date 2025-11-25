from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import ValidationError
import shutil
import os
from pathlib import Path
from . import crud, models_db, models, schemas
from .deps import get_db, get_current_user
from .models import TipoContactoEnum, DetalleTipoEnum
from .email_utils import EmailSender
import json

router = APIRouter()

# Configuración para uploads
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
TEMP_UPLOAD_DIR = UPLOAD_DIR / "temp"
TEMP_UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

def validate_image(file: UploadFile) -> bool:
    """Valida que el archivo sea una imagen"""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail={
                "message": f"Formato de archivo no permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}",
                "field": "imagen",
                "type": "validation_error"
            }
        )
    return True

# ------------------ ENDPOINT DE PRUEBA DE VIDA ------------------
@router.get("/ping", tags=["Root"])
def ping():
    return {"message": "API de contactos está funcionando correctamente."}

# ------------------ CREAR CONTACTO ------------------
# Ahora acepta tanto POST /api/contactos  como POST /api/contactos/
@router.post(
    "",  # ruta raíz del router: /api/contactos
    response_model=schemas.ContactInDB,
    status_code=status.HTTP_201_CREATED,
    tags=["Contactos"]
)
async def create_contacto(
    nombre: str = Form(...),
    telefono: str = Form(...),
    email: Optional[str] = Form(None),
    direccion: Optional[str] = Form(None),
    lugar: Optional[str] = Form(None),
    tipo_contacto: Optional[str] = Form(None),
    tipo_contacto_otro: Optional[str] = Form(None),
    detalle_tipo: Optional[str] = Form(None),
    detalle_tipo_otro: Optional[str] = Form(None),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user)
):
    try:
        user = crud.get_user_by_email(db, current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        # Procesar imagen si se proporciona
        imagen_path = None
        if imagen:
            try:
                validate_image(imagen)
                file_extension = Path(imagen.filename).suffix.lower()
                file_name = f"{user.id}_{nombre}_{os.urandom(8).hex()}{file_extension}"
                file_path = UPLOAD_DIR / file_name
                
                with file_path.open("wb") as buffer:
                    shutil.copyfileobj(imagen.file, buffer)
                
                imagen_path = f"/uploads/{file_name}"
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "message": f"Error al procesar la imagen: {str(e)}",
                        "field": "imagen",
                        "type": "upload_error"
                    }
                )

        # Crear los datos del contacto
        contact_data = schemas.ContactCreate(
            nombre=nombre,
            telefono=telefono,
            email=email if email else None,
            direccion=direccion if direccion else None,
            lugar=lugar if lugar else None,
            tipo_contacto=tipo_contacto if tipo_contacto else None,
            tipo_contacto_otro=tipo_contacto_otro if tipo_contacto_otro else None,
            detalle_tipo=detalle_tipo if detalle_tipo else None,
            detalle_tipo_otro=detalle_tipo_otro if detalle_tipo_otro else None,
            imagen=imagen_path
        )

        # Crear el contacto
        try:
            contact = crud.create_contact(db, contact_data, user.id)
            return contact
        except Exception as e:
            # Si falla la creación del contacto, eliminar la imagen si se subió
            if imagen_path:
                try:
                    os.remove(UPLOAD_DIR / Path(imagen_path).name)
                except:
                    pass
            raise e

    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Error de validación",
                "errors": e.errors()
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error al crear el contacto: {str(e)}",
                "type": "server_error"
            }
        )

# ------------------ LISTAR CONTACTOS ------------------
# Ahora acepta GET /api/contactos  y GET /api/contactos/
@router.get(
    "",
    response_model=schemas.PaginatedContacts,
    tags=["Contactos"]
)
def read_contactos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    q: Optional[str] = None,
    tipo_contacto: Optional[str] = None,
    detalle_tipo: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user)
):
    try:
        user = crud.get_user_by_email(db, current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        query = db.query(models_db.Contact).filter(
            models_db.Contact.owner_id == user.id
        )
        
        if q:
            query = query.filter(
                (models_db.Contact.nombre.ilike(f"%{q}%")) |
                (models_db.Contact.email.ilike(f"%{q}%")) |
                (models_db.Contact.telefono.ilike(f"%{q}%"))
            )
        
        if tipo_contacto:
            query = query.filter(models_db.Contact.tipo_contacto == tipo_contacto)
        
        if detalle_tipo:
            query = query.filter(models_db.Contact.detalle_tipo == detalle_tipo)
        
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "data": items
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error al obtener contactos: {str(e)}",
                "type": "server_error"
            }
        )

# ------------------ OBTENER CONTACTO POR ID ------------------
@router.get(
    "/{contacto_id}",
    response_model=schemas.ContactInDB,
    tags=["Contactos"]
)
def read_contacto(
    contacto_id: int, 
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user)
):
    try:
        # Obtener el usuario actual
        user = crud.get_user_by_email(db, current_user_email)
        if not user:
            raise HTTPException(
                status_code=404,
                detail={
                    "message": "Usuario no encontrado",
                    "type": "not_found"
                }
            )

        # Obtener el contacto
        db_contacto = crud.get_contact(db, contacto_id, user.id)
        if not db_contacto:
            raise HTTPException(
                status_code=404,
                detail={
                    "message": "Contacto no encontrado",
                    "type": "not_found"
                }
            )
        return db_contacto
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error al obtener el contacto: {str(e)}",
                "type": "server_error"
            }
        )

# ------------------ ACTUALIZAR CONTACTO ------------------
@router.put(
    "/{contacto_id}",
    response_model=schemas.ContactInDB,
    tags=["Contactos"]
)
async def update_contacto(
    contacto_id: int,
    nombre: str = Form(...),
    telefono: str = Form(...),
    email: Optional[str] = Form(None),
    direccion: Optional[str] = Form(None),
    lugar: Optional[str] = Form(None),
    tipo_contacto: Optional[str] = Form(None),
    tipo_contacto_otro: Optional[str] = Form(None),
    detalle_tipo: Optional[str] = Form(None),
    detalle_tipo_otro: Optional[str] = Form(None),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user)
):
    try:
        # Obtener el usuario actual
        user = crud.get_user_by_email(db, current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        # Verificar que el contacto existe y pertenece al usuario
        contacto = crud.get_contact(db, contacto_id, user.id)
        if not contacto:
            raise HTTPException(status_code=404, detail="Contacto no encontrado")

        # Procesar imagen si se proporciona una nueva
        imagen_path = contacto.imagen
        if imagen:
            try:
                validate_image(imagen)
                # Eliminar imagen anterior si existe
                if contacto.imagen:
                    old_image_path = Path("uploads") / Path(contacto.imagen).name
                    if old_image_path.exists():
                        old_image_path.unlink()

                file_extension = Path(imagen.filename).suffix.lower()
                file_name = f"{user.id}_{nombre}_{os.urandom(8).hex()}{file_extension}"
                file_path = UPLOAD_DIR / file_name
                
                with file_path.open("wb") as buffer:
                    shutil.copyfileobj(imagen.file, buffer)
                
                imagen_path = f"/uploads/{file_name}"
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Error al procesar la imagen: {str(e)}"
                )

        # Actualizar datos del contacto
        contact_data = schemas.ContactUpdate(
            nombre=nombre,
            telefono=telefono,
            email=email,
            direccion=direccion,
            lugar=lugar,
            tipo_contacto=tipo_contacto,
            tipo_contacto_otro=tipo_contacto_otro,
            detalle_tipo=detalle_tipo,
            detalle_tipo_otro=detalle_tipo_otro,
            imagen=imagen_path
        )

        return crud.update_contact(db, contacto_id, contact_data, user.id)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar el contacto: {str(e)}"
        )

# ------------------ ELIMINAR CONTACTO ------------------
@router.delete(
    "/{contacto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Contactos"]
)
async def delete_contacto(
    contacto_id: int,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user)
):
    try:
        # Obtener el usuario actual
        user = crud.get_user_by_email(db, current_user_email)
        if not user:
            raise HTTPException(
                status_code=404,
                detail={
                    "message": "Usuario no encontrado",
                    "type": "not_found"
                }
            )

        # Intentar eliminar el contacto
        deleted = crud.delete_contact(db, contacto_id, user.id)
        if not deleted:
            raise HTTPException(
                status_code=404,
                detail={
                    "message": "Contacto no encontrado o no tienes permiso para eliminarlo",
                    "type": "not_found"
                }
            )
        return None

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error al eliminar el contacto: {str(e)}",
                "type": "server_error"
            }
        )

# ------------------ SIGNUP ------------------
@router.post("/signup", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.create_user(db, user)
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ------------------ LOGIN ------------------
@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ------------------ CREAR CALIFICACION ------------------
@router.post(
    "/{contact_id}/ratings",
    response_model=List[schemas.RatingInDB],
    tags=["Calificaciones"]
)
async def create_rating(
    contact_id: int,
    ratings: List[schemas.RatingCreate],
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user)
):
    try:
        user = crud.get_user_by_email(db, current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        contact = crud.get_contact(db, contact_id, user.id)
        if not contact:
            raise HTTPException(status_code=404, detail="Contacto no encontrado")

        db_ratings = []
        total_rating = 0

        for rating in ratings:
            db_rating = crud.create_rating(db, rating, contact_id)
            db_ratings.append(db_rating)
            total_rating += rating.calificacion

        # Calcular y actualizar el promedio
        average = total_rating / len(ratings)
        crud.update_contact_rating(db, contact_id, average)

        return db_ratings

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear calificación: {str(e)}"
        )

@router.get(
    "/{contact_id}/ratings",
    response_model=List[schemas.RatingInDB],
    tags=["Calificaciones"]
)
def get_contact_ratings(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user)
):
    try:
        # Obtener el usuario actual
        user = crud.get_user_by_email(db, current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        # Verificar que el contacto existe y pertenece al usuario
        contact = crud.get_contact(db, contact_id, user.id)
        if not contact:
            raise HTTPException(status_code=404, detail="Contacto no encontrado")

        # Obtener las calificaciones
        ratings = db.query(models_db.Rating).filter(
            models_db.Rating.contact_id == contact_id
        ).order_by(models_db.Rating.fecha.desc()).all()

        return ratings

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error al obtener las calificaciones: {str(e)}",
                "type": "server_error"
            }
        )

# ------------------ ENVIAR EMAIL ------------------
@router.post("/send-email", tags=["Email"])
async def send_email(
    subject: str = Form(...),
    message: str = Form(...),
    recipients: str = Form(...),
    attachments: List[UploadFile] = File(None),
    current_user_email: str = Depends(get_current_user)
):
    try:
        recipients_list = json.loads(recipients)
        temp_files = []

        if attachments:
            for file in attachments:
                temp_path = TEMP_UPLOAD_DIR / file.filename
                with open(temp_path, "wb") as buffer:
                    buffer.write(await file.read())
                temp_files.append(str(temp_path))

        try:
            email_sender = EmailSender()
            await email_sender.send_email(
                recipients=recipients_list,
                subject=subject,
                message=message,
                attachments=temp_files if temp_files else None
            )

            # Limpiar archivos temporales
            for file_path in temp_files:
                if os.path.exists(file_path):
                    os.remove(file_path)

            return {"message": "Email enviado correctamente"}

        except Exception as e:
            # Limpiar archivos temporales en caso de error
            for file_path in temp_files:
                if os.path.exists(file_path):
                    os.remove(file_path)
            raise HTTPException(
                status_code=500,
                detail=f"Error al enviar el email: {str(e)}"
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en el procesamiento: {str(e)}"
        )
