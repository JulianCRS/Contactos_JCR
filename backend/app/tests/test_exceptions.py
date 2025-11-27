# test_exceptions.py
import pytest
import uuid


def unique_email():
    """Genera un email único para cada test"""
    return f"test_{uuid.uuid4().hex[:8]}@example.com"


def unique_username():
    """Genera un username único para cada test"""
    return f"User_{uuid.uuid4().hex[:8]}"


@pytest.fixture
def authenticated_client(client):
    """
    Crea un usuario y retorna un cliente autenticado con su token
    """
    email = unique_email()
    username = unique_username()
    
    response = client.post("/api/auth/signup", json={
        "email": email,
        "username": username,
        "password": "testpass123"
    })
    
    token = response.json()["access_token"]
    client.headers = {"Authorization": f"Bearer {token}"}
    return client


# ------------------------------------------------------------------------------------
# TEST 1: Validación de campos requeridos al crear contacto
# ------------------------------------------------------------------------------------
def test_create_contact_missing_required_fields(authenticated_client):
    """
    Prueba que se lance excepción cuando faltan campos requeridos
    Campos requeridos: nombre y telefono
    """
    # Intento 1: Sin nombre ni teléfono
    response = authenticated_client.post("/api/contactos", data={})
    assert response.status_code == 422  # Unprocessable Entity
    
    # Intento 2: Solo nombre (falta teléfono)
    response = authenticated_client.post("/api/contactos", data={
        "nombre": "Test Usuario"
    })
    assert response.status_code == 422
    
    # Intento 3: Solo teléfono (falta nombre)
    response = authenticated_client.post("/api/contactos", data={
        "telefono": "3001234567"
    })
    assert response.status_code == 422
    
    # Verificar que el mensaje de error es informativo
    error_detail = response.json()
    assert "detail" in error_detail


# ------------------------------------------------------------------------------------
# TEST 2: Autenticación inválida o token expirado
# ------------------------------------------------------------------------------------
def test_operations_with_invalid_token(client):
    """
    Prueba que se lance excepción 401 cuando el token es inválido o no existe
    """
    # Intento 1: Sin token (sin autenticación)
    response = client.get("/api/contactos")
    assert response.status_code == 401
    
    # Intento 2: Token inválido
    client.headers = {"Authorization": "Bearer token_invalido_12345"}
    response = client.get("/api/contactos")
    assert response.status_code == 401
    
    # Intento 3: Formato de token incorrecto
    client.headers = {"Authorization": "InvalidFormat"}
    response = client.get("/api/contactos")
    assert response.status_code == 401
    
    # Intento 4: Intentar crear contacto sin autenticación
    client.headers = {}
    response = client.post("/api/contactos", data={
        "nombre": "Test",
        "telefono": "3001234567"
    })
    assert response.status_code == 401
    
    # Intento 5: Intentar actualizar contacto sin autenticación
    response = client.put("/api/contactos/1", data={
        "nombre": "Test",
        "telefono": "3001234567"
    })
    assert response.status_code == 401
    
    # Intento 6: Intentar eliminar contacto sin autenticación
    response = client.delete("/api/contactos/1")
    assert response.status_code == 401