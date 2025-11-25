def test_create_and_read_contact(client):
    # Crear un nuevo contacto
    payload = {
        "nombre": "María Pérez",
        "telefono": "+573001112233",
        "email": "maria@example.com"
    }
    resp = client.post("/api/contactos/", json=payload)
    assert resp.status_code == 201
    created = resp.json()
    assert created["nombre"] == payload["nombre"]

    # Leer el mismo contacto
    resp2 = client.get(f"/api/contactos/{created['id']}")
    assert resp2.status_code == 200
    assert resp2.json()["email"] == payload["email"]

def test_update_and_delete_contact(client):
    # Primero, crear
    resp = client.post("/api/contactos/", json={
        "nombre": "Juan Gómez",
        "telefono": "+573221234567",
        "email": "juan@example.com"
    })
    cid = resp.json()["id"]

    # Actualizar
    update_payload = {"nombre": "Juan G.", "telefono": "+573221234568"}
    resp2 = client.put(f"/api/contactos/{cid}", json=update_payload)
    assert resp2.status_code == 200
    assert resp2.json()["nombre"] == "Juan G."

    # Eliminar
    resp3 = client.delete(f"/api/contactos/{cid}")
    assert resp3.status_code == 204

    # Verificar que ahora 404
    resp4 = client.get(f"/api/contactos/{cid}")
    assert resp4.status_code == 404
