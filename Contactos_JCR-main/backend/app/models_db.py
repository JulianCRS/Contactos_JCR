from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"))
    categoria = Column(String)
    calificacion = Column(Integer)
    comentario = Column(String(150))
    fecha = Column(DateTime, default=datetime.utcnow)
    
    contact = relationship("Contact", back_populates="ratings")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    imagen = Column(Text, nullable=True)
    telefono = Column(String)
    email = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    lugar = Column(String, nullable=True)
    tipo_contacto = Column(String, nullable=True)
    tipo_contacto_otro = Column(String, nullable=True)
    detalle_tipo = Column(String, nullable=True)
    detalle_tipo_otro = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="contacts")
    ratings = relationship("Rating", back_populates="contact", cascade="all, delete")
    average_rating = Column(Float, nullable=True)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    contacts = relationship("Contact", back_populates="owner")
