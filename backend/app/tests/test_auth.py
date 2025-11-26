import pytest
import uuid


def unique_email():
    """Genera un email único para cada test"""
    return f"test_{uuid.uuid4().hex[:8]}@example.com"


def unique_username():
    """Genera un username único para cada test"""
    return f"User_{uuid.uuid4().hex[:8]}"


def test_register_user(client):
    email = unique_email()
    username = unique_username()
    payload = {
        "email": email,
        "username": username,
        "password": "12345678"
    }

    resp = client.post("/api/auth/signup", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == payload["username"]


def test_login_success(client):
    email = unique_email()
    username = unique_username()
    
    client.post("/api/auth/signup", json={
        "email": email,
        "password": "abc123",
        "username": username
    })

    resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "abc123"
    })

    assert resp.status_code == 200
    data = resp.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    email = unique_email()
    username = unique_username()
    
    client.post("/api/auth/signup", json={
        "email": email,
        "password": "secret",
        "username": username
    })

    resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "incorrecto"
    })

    assert resp.status_code == 401