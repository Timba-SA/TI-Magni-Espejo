"""
test_auth.py — Tests de integración del módulo Auth.
Cubre los patrones del §13.3 de la especificación v6.0:
  - register OK
  - login OK
  - login con credenciales inválidas (401)
  - logout
  - /me con token válido
  - rate limit (429) — verificación de configuración
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.modules.usuarios.models import Usuario
from app.modules.auth.models import UsuarioRol
from app.core.security import get_password_hash


# ── Helpers ───────────────────────────────────────────────────────────────────

def _crear_usuario(db_session: Session, email: str, password: str, rol: str = "CLIENT") -> Usuario:
    u = Usuario(
        nombre="Test",
        apellido="User",
        email=email,
        password_hash=get_password_hash(password),
        is_active=True,
    )
    db_session.add(u)
    db_session.flush()
    db_session.refresh(u)
    db_session.add(UsuarioRol(usuario_id=u.id, rol_codigo=rol))
    db_session.commit()
    db_session.refresh(u)
    return u


# ── Register ──────────────────────────────────────────────────────────────────

class TestRegister:
    def test_register_ok_devuelve_201_y_access_token(self, client: TestClient):
        resp = client.post("/api/v1/auth/register", json={
            "nombre": "Juan",
            "apellido": "Perez",
            "email": "juan@test.com",
            "password": "Password123",
        })
        assert resp.status_code == 201
        body = resp.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"

    def test_register_email_duplicado_devuelve_409(self, client: TestClient, db_session: Session):
        _crear_usuario(db_session, "dup@test.com", "Password123")
        resp = client.post("/api/v1/auth/register", json={
            "nombre": "Otro",
            "apellido": "User",
            "email": "dup@test.com",
            "password": "Password123",
        })
        assert resp.status_code == 409

    def test_register_password_minimo_8_chars(self, client: TestClient):
        resp = client.post("/api/v1/auth/register", json={
            "nombre": "A",
            "apellido": "B",
            "email": "short@test.com",
            "password": "123",
        })
        assert resp.status_code == 422


# ── Login ─────────────────────────────────────────────────────────────────────

class TestLogin:
    def test_login_ok_devuelve_200_y_access_token(self, client: TestClient, db_session: Session):
        _crear_usuario(db_session, "login@test.com", "Password123")
        resp = client.post("/api/v1/auth/login", json={
            "email": "login@test.com",
            "password": "Password123",
        })
        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"

    def test_login_password_incorrecto_devuelve_401(self, client: TestClient, db_session: Session):
        _crear_usuario(db_session, "wrong@test.com", "Password123")
        resp = client.post("/api/v1/auth/login", json={
            "email": "wrong@test.com",
            "password": "ContraseñaMal",
        })
        assert resp.status_code == 401

    def test_login_email_inexistente_devuelve_401(self, client: TestClient):
        resp = client.post("/api/v1/auth/login", json={
            "email": "noexiste@test.com",
            "password": "Password123",
        })
        assert resp.status_code == 401

    def test_login_usuario_inactivo_devuelve_403(self, client: TestClient, db_session: Session):
        u = _crear_usuario(db_session, "inactivo@test.com", "Password123")
        u.is_active = False
        db_session.add(u)
        db_session.commit()
        resp = client.post("/api/v1/auth/login", json={
            "email": "inactivo@test.com",
            "password": "Password123",
        })
        assert resp.status_code == 403


# ── /me ───────────────────────────────────────────────────────────────────────

class TestMe:
    def test_me_con_token_valido_devuelve_200(self, client: TestClient, admin_headers: dict):
        resp = client.get("/api/v1/auth/me", headers=admin_headers)
        assert resp.status_code == 200

    def test_me_sin_token_devuelve_401(self, client: TestClient):
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    def test_me_token_invalido_devuelve_401(self, client: TestClient):
        resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer token_falso"})
        assert resp.status_code == 401


# ── Logout ────────────────────────────────────────────────────────────────────

class TestLogout:
    def test_logout_ok_devuelve_204(self, client: TestClient, client_headers: dict):
        resp = client.post("/api/v1/auth/logout", headers=client_headers)
        assert resp.status_code == 204

    def test_logout_sin_token_devuelve_401(self, client: TestClient):
        resp = client.post("/api/v1/auth/logout")
        assert resp.status_code == 401


# ── Rate limiting ─────────────────────────────────────────────────────────────

class TestRateLimit:
    def test_login_rate_limit_configurado(self, client: TestClient):
        """Verifica que el endpoint /login tiene rate limiting activo (config: 5/15min)."""
        # Enviamos 6 requests seguidos con email inexistente — el 6to debe ser 429
        payload = {"email": "rl@test.com", "password": "cualquiera"}
        responses = [client.post("/api/v1/auth/login", json=payload) for _ in range(6)]
        status_codes = [r.status_code for r in responses]
        # Los primeros 5 deben ser 401 (credenciales inválidas) y el 6to 429
        assert 429 in status_codes, f"Se esperaba 429 en algún intento, status_codes={status_codes}"

    def test_register_rate_limit_configurado(self, client: TestClient):
        """Verifica que el endpoint /register también tiene rate limiting activo (5/15min)."""
        responses = [
            client.post("/api/v1/auth/register", json={
                "nombre": f"U{i}",
                "apellido": "Test",
                "email": f"rl_reg_{i}@test.com",
                "password": "Password123",
            })
            for i in range(6)
        ]
        status_codes = [r.status_code for r in responses]
        assert 429 in status_codes, f"Se esperaba 429 en algún intento, status_codes={status_codes}"
