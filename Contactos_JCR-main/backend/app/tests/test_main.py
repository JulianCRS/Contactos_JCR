from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models import CategoriaEvaluacionEnum

def test_crear_contacto(client: TestClient, db: Session):
    """Test para verificar la creación de un contacto"""
    # Crear usuario con todos los campos requeridos
    signup_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    }
    signup_response = client.post("/api/auth/signup", json=signup_data)
    print("Signup response:", signup_response.status_code, signup_response.json())
    assert signup_response.status_code == 200 or signup_response.status_code == 201  # Cambiamos a 200 que es el código correcto

    # Login (usar email y json)
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    login_response = client.post("/api/auth/login", json=login_data)
    print("Login response:", login_response.status_code, login_response.json())
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Crear contacto
    contact_data = {
        "nombre": "Test Contact",
        "telefono": "+573001234567",
        "email": "contact@test.com",
        "tipo_contacto": "Proveedor"
    }
    response = client.post(
        "/api/contactos/",
        data=contact_data,
        headers=headers
    )
    assert response.status_code == 201

def test_obtener_contactos(client: TestClient, db: Session):
    """Test para verificar la obtención de contactos"""
    # Login
    signup_data = {
        "email": "test2@example.com",
        "username": "testuser2",
        "password": "testpass123"
    }
    client.post("/api/auth/signup", json=signup_data)
    
    login_data = {
        "email": signup_data["email"],
        "password": signup_data["password"]
    }
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/contactos/", headers=headers)
    assert response.status_code == 200
    assert "data" in response.json()

def test_calificar_contacto(client: TestClient, db: Session):
    """Test para verificar la calificación de un contacto"""
    # Setup: crear usuario y login
    signup_data = {
        "username": "testuser3",
        "email": "test3@example.com",
        "password": "testpass123"
    }
    signup_response = client.post("/api/auth/signup", json=signup_data)
    assert signup_response.status_code == 200 or signup_response.status_code == 201

    login_data = {
        "email": "test3@example.com",
        "password": "testpass123"
    }
    login_response = client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Crear contacto
    contact_data = {
        "nombre": "Test Contact",
        "telefono": "+573001234567",
        "tipo_contacto": "Proveedor"
    }
    contact_response = client.post(
        "/api/contactos/",
        data=contact_data,
        headers=headers
    )
    assert contact_response.status_code == 201
    contact_id = contact_response.json()["id"]

    # Calificar contacto
    rating_data = [{
        "categoria": "CALIDAD_PRODUCTO",
        "calificacion": 4,
        "comentario": "Buen servicio"
    }]
    response = client.post(
        f"/api/contactos/{contact_id}/ratings",
        json=rating_data,
        headers=headers
    )
    assert response.status_code == 200

def test_validacion_email(client: TestClient, db: Session):
    """Test para verificar la validación del formato de email"""
    # Setup
    signup_data = {
        "email": "test4@example.com",
        "username": "testuser4",
        "password": "testpass123"
    }
    client.post("/api/auth/signup", json=signup_data)
    
    login_data = {
        "email": signup_data["email"],
        "password": signup_data["password"]
    }
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test email inválido
    invalid_contact = {
        "nombre": "Test Contact",
        "telefono": "+573001234567",
        "email": "invalid-email"
    }
    response = client.post(
        "/api/contactos/",
        data=invalid_contact,
        headers=headers
    )
    assert response.status_code == 422

def test_filtrar_contactos(client: TestClient, db: Session):
    """Test para verificar el filtrado de contactos por tipo"""
    # Setup
    signup_data = {
        "email": "test5@example.com",
        "username": "testuser5",
        "password": "testpass123"
    }
    client.post("/api/auth/signup", json=signup_data)
    
    login_data = {
        "email": signup_data["email"],
        "password": signup_data["password"]
    }
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Crear contactos
    client.post(
        "/api/contactos/",
        data={
            "nombre": "Proveedor",
            "telefono": "+573001234567",
            "tipo_contacto": "Proveedor"
        },
        headers=headers
    )
    
    # Filtrar
    response = client.get(
        "/api/contactos/?tipo_contacto=Proveedor",
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1
    assert data["data"][0]["tipo_contacto"] == "Proveedor"