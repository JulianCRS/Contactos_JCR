from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models_db, schemas
from app.auth import get_password_hash, verify_password
from pathlib import Path
from sqlalchemy import func

def get_contact(db: Session, contacto_id: int, user_id: int):
    """
    Obtiene un contacto por su ID y verifica que pertenezca al usuario.
    """
    return db.query(models_db.Contact).filter(
        models_db.Contact.id == contacto_id,
        models_db.Contact.owner_id == user_id
    ).first()

def get_contacts(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Obtiene la lista de contactos de un usuario específico
    """
    return db.query(models_db.ContactModel).filter(
        models_db.ContactModel.owner_id == user_id
    ).offset(skip).limit(limit).all()

def create_contact(db: Session, contacto: schemas.ContactCreate, user_id: int):
    """
    Crea un nuevo contacto asociado a un usuario.
    """
    try:
        contact_dict = contacto.dict()
        db_contact = models_db.Contact(**contact_dict, owner_id=user_id)
        db.add(db_contact)
        db.commit()
        db.refresh(db_contact)
        return db_contact
    except Exception as e:
        db.rollback()
        raise Exception(f"Error al crear el contacto en la base de datos: {str(e)}")

def update_contact(db: Session, contacto_id: int, datos: schemas.ContactUpdate, user_id: int):
    """
    Actualiza un contacto si existe y pertenece al usuario.
    """
    contacto_db = get_contact(db, contacto_id, user_id)
    if not contacto_db:
        return None
    
    for key, value in datos.dict(exclude_unset=True).items():
        setattr(contacto_db, key, value)
    
    try:
        db.commit()
        db.refresh(contacto_db)
        return contacto_db
    except Exception as e:
        db.rollback()
        raise Exception(f"Error al actualizar el contacto: {str(e)}")

def delete_contact(db: Session, contacto_id: int, user_id: int):
    """
    Elimina un contacto por ID si existe y pertenece al usuario.
    """
    contacto_db = get_contact(db, contacto_id, user_id)
    if not contacto_db:
        return None
    
    # Si el contacto tiene una imagen, eliminarla
    if contacto_db.imagen:
        try:
            imagen_path = Path("uploads") / Path(contacto_db.imagen).name
            if imagen_path.exists():
                imagen_path.unlink()
        except Exception as e:
            print(f"Error al eliminar imagen: {str(e)}")
    
    db.delete(contacto_db)
    db.commit()
    return contacto_db

def get_user_by_email(db: Session, email: str):
    """
    Obtiene un usuario por su email
    """
    return db.query(models_db.User).filter(models_db.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models_db.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_rating(db: Session, rating: schemas.RatingCreate, contact_id: int):
    db_rating = models_db.Rating(**rating.dict(), contact_id=contact_id)
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating

def update_contact_rating(db: Session, contact_id: int, new_rating: float):
    contact = db.query(models_db.Contact).filter(models_db.Contact.id == contact_id).first()
    if contact:
        # Calcular el nuevo promedio
        ratings_count = db.query(models_db.Rating).filter(
            models_db.Rating.contact_id == contact_id
        ).count()
        
        if ratings_count > 0:
            total_rating = db.query(func.sum(models_db.Rating.calificacion)).filter(
                models_db.Rating.contact_id == contact_id
            ).scalar() or 0
            contact.average_rating = total_rating / ratings_count
        else:
            contact.average_rating = new_rating
            
        db.commit()
        return contact

def get_contact_ratings(db: Session, contact_id: int):
    """
    Obtiene todas las calificaciones de un contacto específico.
    """
    return db.query(models_db.Rating).filter(
        models_db.Rating.contact_id == contact_id
    ).order_by(models_db.Rating.fecha.desc()).all()
