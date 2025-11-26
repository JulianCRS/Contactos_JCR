from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_signup_success(client: TestClient):
    """Debe permitir registrar un usuario nuevo"""
    data = {
        "username": "user1",
        "email": "user1@test.com",
        "password": "testpass123"
    }

    response = client.post("/api/auth/signup", json=data)

    assert response.status_code in [200, 201]
    body = response.json()
    assert "id" in body
    assert body["email"] == data["email"]


def test_signup_email_duplicado(client: TestClient):
    """No debe permitir registrar 2 usuarios con el mismo email"""
    data = {
        "username": "user2",
        "email": "duplicado@test.com",
        "password": "testpass123"
    }

    # Primer registro OK
    client.post("/api/auth/signup", json=data)

    # Segundo debe fallar
    response = client.post("/api/auth/signup", json=data)

    # Tu API puede devolver 400, 409 o 422 según lo implementado
    assert response.status_code in [400, 409, 422]


def test_login_success(client: TestClient):
    """Debe generar token al loguearse correctamente"""
    signup_data = {
        "username": "user3",
        "email": "user3@test.com",
        "password": "testpass123"
    }
    client.post("/api/auth/signup", json=signup_data)

    login_data = {
        "email": signup_data["email"],
        "password": signup_data["password"]
    }

    response = client.post("/api/auth/login", json=login_data)

    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_password_incorrecta(client: TestClient):
    """Debe fallar si la contraseña no es correcta"""
    signup_data = {
        "username": "user4",
        "email": "user4@test.com",
        "password": "testpass123"
    }
    client.post("/api/auth/signup", json=signup_data)

    login_data = {
        "email": signup_data["email"],
        "password": "claveMala123"
    }

    response = client.post("/api/auth/login", json=login_data)

    assert response.status_code in [400, 401]


def test_login_usuario_no_existe(client: TestClient):
    """Debe fallar si el usuario no está registrado"""
    login_data = {
        "email": "noexiste@test.com",
        "password": "algo123"
    }

    response = client.post("/api/auth/login", json=login_data)

    assert response.status_code in [400, 401, 404]


def test_signup_email_invalido(client: TestClient):
    """Debe fallar si el email no tiene formato válido"""
    data = {
        "username": "user5",
        "email": "wrong-format",
        "password": "testpass123"
    }

    response = client.post("/api/auth/signup", json=data)

    assert response.status_code == 422

