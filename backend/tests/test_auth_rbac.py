import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from datetime import datetime, timezone

from main import app
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.modules.usuarios.models import Usuario
from app.modules.auth.models import UsuarioRol, Rol
from app.core.security import create_access_token

# Setup in-memory DB para testeo de autenticación aislado
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

def override_get_session():
    with Session(engine) as session:
        yield session

client = TestClient(app)

@pytest.fixture(autouse=True)
def prepare_db():
    # Solo override de sesión, NO sobreescribimos get_current_user
    app.dependency_overrides[get_session] = override_get_session
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]
        
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Roles
        rol_admin = Rol(codigo="ADMIN", nombre="Administrador")
        rol_stock = Rol(codigo="STOCK", nombre="Stock")
        rol_client = Rol(codigo="CLIENT", nombre="Cliente")
        session.add_all([rol_admin, rol_stock, rol_client])
        
        # Admin (ID 1)
        admin = Usuario(
            id=1,
            nombre="Admin",
            apellido="TFS",
            email="admin@test.com",
            password_hash="hash_admin",
            is_active=True,
        )
        session.add(admin)
        session.flush()
        session.add(UsuarioRol(usuario_id=admin.id, rol_codigo="ADMIN"))
        
        # Gestor de Stock (ID 2)
        stock_user = Usuario(
            id=2,
            nombre="Stockist",
            apellido="TFS",
            email="stock@test.com",
            password_hash="hash_stock",
            is_active=True,
        )
        session.add(stock_user)
        session.flush()
        session.add(UsuarioRol(usuario_id=stock_user.id, rol_codigo="STOCK"))
        
        # Cliente (ID 3)
        client_user = Usuario(
            id=3,
            nombre="Client",
            apellido="TFS",
            email="client@test.com",
            password_hash="hash_client",
            is_active=True,
        )
        session.add(client_user)
        session.flush()
        session.add(UsuarioRol(usuario_id=client_user.id, rol_codigo="CLIENT"))
        
        session.commit()

    yield
    
    SQLModel.metadata.drop_all(engine)
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]


def test_endpoint_requiere_autenticacion_sin_cookie():
    # Intentar acceder a /usuarios/me sin cookie
    response = client.get("/api/v1/usuarios/me")
    assert response.status_code == 401
    assert "token" in response.json()["detail"].lower()


def test_endpoint_requiere_autenticacion_cookie_invalida():
    # Cookie con token inventado/inválido
    client.cookies.set("access_token", "invalid_jwt_token")
    response = client.get("/api/v1/usuarios/me")
    # Limpiar cookies para el próximo test
    client.cookies.clear()
    
    assert response.status_code == 401
    assert "inválido" in response.json()["detail"].lower()


def test_endpoint_lectura_perfil_con_cookie_valida():
    # Generar token JWT válido para el cliente
    token = create_access_token({"sub": "3", "email": "client@test.com", "roles": ["CLIENT"]})
    
    client.cookies.set("access_token", token)
    response = client.get("/api/v1/usuarios/me")
    client.cookies.clear()
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "client@test.com"


def test_roles_admin_accede_a_usuarios_admin_only():
    token = create_access_token({"sub": "1", "email": "admin@test.com", "roles": ["ADMIN"]})
    
    client.cookies.set("access_token", token)
    response = client.get("/api/v1/usuarios/")
    client.cookies.clear()
    
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


def test_roles_client_no_accede_a_usuarios_admin_only():
    token = create_access_token({"sub": "3", "email": "client@test.com", "roles": ["CLIENT"]})
    
    client.cookies.set("access_token", token)
    response = client.get("/api/v1/usuarios/")
    client.cookies.clear()
    
    assert response.status_code == 403
    assert "rol" in response.json()["detail"].lower()


def test_roles_stock_puede_crear_ingrediente():
    token = create_access_token({"sub": "2", "email": "stock@test.com", "roles": ["STOCK"]})
    
    payload = {
        "nombre": "Insumo Test",
        "stock_actual": 10,
        "stock_minimo": 2,
        "unidad_medida_id": 1,
        "es_alergeno": False,
        "peso": 1.5
    }
    
    # Mockear el service de ingredientes para no requerir insertar una UnidadMedida real en DB in-memory
    # O mejor, inyectamos una unidad de medida real en el setup de db
    with Session(engine) as session:
        from app.modules.productos.models import UnidadMedida
        um = UnidadMedida(id=1, nombre="Kilogramo", simbolo="kg", tipo="masa")
        session.add(um)
        session.commit()

    client.cookies.set("access_token", token)
    response = client.post("/api/v1/ingredientes/", json=payload)
    client.cookies.clear()
    
    assert response.status_code == 201
    assert response.json()["nombre"] == "Insumo Test"


def test_roles_client_no_puede_crear_ingrediente():
    token = create_access_token({"sub": "3", "email": "client@test.com", "roles": ["CLIENT"]})
    
    payload = {
        "nombre": "Insumo Test",
        "stock_actual": 10,
        "stock_minimo": 2,
        "unidad_medida_id": 1,
        "es_alergeno": False,
        "peso": 1.5
    }
    
    client.cookies.set("access_token", token)
    response = client.post("/api/v1/ingredientes/", json=payload)
    client.cookies.clear()
    
    assert response.status_code == 403
