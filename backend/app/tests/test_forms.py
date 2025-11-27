# test_contacts.py
import pytest
import uuid
from io import BytesIO


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
    
    # Registrar usuario
    response = client.post("/api/auth/signup", json={
        "email": email,
        "username": username,
        "password": "testpass123"
    })
    
    token = response.json()["access_token"]
    
    # Configurar headers de autenticación
    client.headers = {"Authorization": f"Bearer {token}"}
    return client




# ------------------------------------------------------------------------------------
# TEST: Crear contacto sin autenticación (debe fallar)
# ------------------------------------------------------------------------------------
def test_create_contact_unauthorized(client):
    """Prueba que no se puede crear contacto sin autenticación"""
    data = {
        "nombre": "Test Sin Auth",
        "telefono": "3001234567"
    }
    
    response = client.post("/api/contactos", data=data)
    assert response.status_code == 401



# TEST: Crear contacto con campos mínimos requeridos
# ------------------------------------------------------------------------------------
def test_create_contact_minimal_fields(authenticated_client):
    """Prueba crear contacto solo con campos requeridos (nombre y teléfono)"""
    data = {
        "nombre": "María García",
        "telefono": "3009876543"
    }
    
    response = authenticated_client.post("/api/contactos", data=data)
    assert response.status_code == 201
    result = response.json()
    
    assert result["nombre"] == data["nombre"]
    assert result["telefono"] == data["telefono"]
    assert result["email"] is None or result["email"] == ""


'''
# ------------------------------------------------------------------------------------
# TEST: Listar contactos
# ------------------------------------------------------------------------------------
def test_get_contacts(authenticated_client):
    """Prueba listar todos los contactos del usuario"""
    # Crear algunos contactos
    contact1 = {
        "nombre": "Contacto 1",
        "telefono": "3001111111",
        "tipo_contacto": "personal"
    }
    contact2 = {
        "nombre": "Contacto 2",
        "telefono": "3002222222",
        "tipo_contacto": "trabajo"
    }
    
    authenticated_client.post("/api/contactos", data=contact1)
    authenticated_client.post("/api/contactos", data=contact2)
    
    # Obtener todos los contactos
    response = authenticated_client.get("/api/contactos")
    assert response.status_code == 200
    result = response.json()
    
    assert "total" in result
    assert "data" in result
    assert result["total"] >= 2
    assert len(result["data"]) >= 2
'''


# ------------------------------------------------------------------------------------
# TEST: Buscar contactos por query
# ------------------------------------------------------------------------------------
def test_search_contacts(authenticated_client):
    """Prueba buscar contactos por nombre, email o teléfono"""
    # Crear un contacto con datos específicos
    data = {
        "nombre": "Pedro Búsqueda Test",
        "telefono": "3005555555",
        "email": "pedro.busqueda@test.com"
    }
    authenticated_client.post("/api/contactos", data=data)
    
    # Buscar por nombre
    response = authenticated_client.get("/api/contactos?q=Búsqueda")
    assert response.status_code == 200
    result = response.json()
    
    assert result["total"] >= 1
    assert any("Búsqueda" in contact["nombre"] for contact in result["data"])



# ------------------------------------------------------------------------------------
# TEST: Filtrar contactos por tipo
# ------------------------------------------------------------------------------------
def test_filter_contacts_by_type(authenticated_client):
    """Prueba filtrar contactos por tipo_contacto"""
    # Crear contactos de diferentes tipos
    personal = {
        "nombre": "Contacto Personal",
        "telefono": "3001111111",
        "tipo_contacto": "personal"
    }
    trabajo = {
        "nombre": "Contacto Trabajo",
        "telefono": "3002222222",
        "tipo_contacto": "trabajo"
    }
    
    authenticated_client.post("/api/contactos", data=personal)
    authenticated_client.post("/api/contactos", data=trabajo)
    
    # Filtrar solo contactos personales
    response = authenticated_client.get("/api/contactos?tipo_contacto=personal")
    assert response.status_code == 200
    result = response.json()
    
    assert all(contact["tipo_contacto"] == "personal" for contact in result["data"])




# ------------------------------------------------------------------------------------
# TEST: Obtener contacto por ID
# ------------------------------------------------------------------------------------
def test_get_contact_by_id(authenticated_client):
    """Prueba obtener un contacto específico por ID"""
    # Crear un contacto
    data = {
        "nombre": "Ana Obtener Test",
        "telefono": "3007777777"
    }
    
    create_response = authenticated_client.post("/api/contactos", data=data)
    contact_id = create_response.json()["id"]
    
    # Obtener el contacto por ID
    response = authenticated_client.get(f"/api/contactos/{contact_id}")
    assert response.status_code == 200
    result = response.json()
    
    assert result["id"] == contact_id
    assert result["nombre"] == data["nombre"]
    assert result["telefono"] == data["telefono"]




# ------------------------------------------------------------------------------------
# TEST: Actualizar contacto
# ------------------------------------------------------------------------------------
def test_update_contact(authenticated_client):
    """Prueba actualizar un contacto existente"""
    # Crear un contacto
    original_data = {
        "nombre": "Carlos Original",
        "telefono": "3008888888",
        "email": "carlos.original@test.com"
    }
    
    create_response = authenticated_client.post("/api/contactos", data=original_data)
    contact_id = create_response.json()["id"]
    
    # Actualizar el contacto
    updated_data = {
        "nombre": "Carlos Actualizado",
        "telefono": "3009999999",
        "email": "carlos.nuevo@test.com",
        "direccion": "Nueva Dirección 456"
    }
    
    response = authenticated_client.put(f"/api/contactos/{contact_id}", data=updated_data)
    assert response.status_code == 200
    result = response.json()
    
    assert result["id"] == contact_id
    assert result["nombre"] == updated_data["nombre"]
    assert result["telefono"] == updated_data["telefono"]
    assert result["email"] == updated_data["email"]
    assert result["direccion"] == updated_data["direccion"]



'''
# ------------------------------------------------------------------------------------
# TEST: Eliminar contacto
# ------------------------------------------------------------------------------------
def test_delete_contact(authenticated_client):
    """Prueba eliminar un contacto"""
    # Crear un contacto
    data = {
        "nombre": "Laura Eliminar",
        "telefono": "3006666666"
    }
    
    create_response = authenticated_client.post("/api/contactos", data=data)
    contact_id = create_response.json()["id"]
    
    # Eliminar el contacto
    response = authenticated_client.delete(f"/api/contactos/{contact_id}")
    assert response.status_code == 204
    
    # Verificar que el contacto ya no existe
    get_response = authenticated_client.get(f"/api/contactos/{contact_id}")
    assert get_response.status_code == 404

'''

