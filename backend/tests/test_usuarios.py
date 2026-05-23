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
from app.core.security import verify_password

# Setup in-memory DB para testeo aislado
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Compilador de ARRAY para SQLite (requerido para SQLModel en sqlite)
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import ARRAY

@compiles(ARRAY, "sqlite")
def compile_array_sqlite(type_, compiler, **kw):
    return "TEXT"

# Usuario autenticado simulado dinámicamente
# Por defecto simulamos un ADMIN (ID=1)
current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

def override_get_session():
    with Session(engine) as session:
        yield session

def override_get_current_user():
    return current_test_user

client = TestClient(app)

@pytest.fixture(autouse=True)
def prepare_db():
    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    SQLModel.metadata.create_all(engine)
    
    # Insertar roles y usuarios iniciales de prueba
    with Session(engine) as session:
        # Roles del sistema
        rol_admin = Rol(codigo="ADMIN", nombre="Administrador", descripcion="Acceso total")
        rol_encargado = Rol(codigo="ENCARGADO", nombre="Encargado", descripcion="Gestión de tienda")
        rol_client = Rol(codigo="CLIENT", nombre="Cliente", descripcion="Cliente final")
        session.add_all([rol_admin, rol_encargado, rol_client])
        
        # Admin inicial (quien realiza las peticiones)
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
        
        # Asignar rol ADMIN al admin inicial
        session.add(UsuarioRol(usuario_id=admin.id, rol_codigo="ADMIN"))
        
        # Otros usuarios de prueba
        user_enc = Usuario(
            id=2,
            nombre="Pedro",
            apellido="Gomez",
            email="pedro.encargado@test.com",
            password_hash="hash_pedro",
            is_active=True,
        )
        user_cli = Usuario(
            id=3,
            nombre="Maria",
            apellido="Lopez",
            email="maria.cliente@test.com",
            password_hash="hash_maria",
            is_active=True,
        )
        session.add_all([user_enc, user_cli])
        session.flush()
        
        session.add(UsuarioRol(usuario_id=user_enc.id, rol_codigo="ENCARGADO"))
        session.add(UsuarioRol(usuario_id=user_cli.id, rol_codigo="CLIENT"))
        
        # Usuario eliminado lógicamente (Soft Delete)
        user_del = Usuario(
            id=4,
            nombre="Baja",
            apellido="Logica",
            email="eliminado@test.com",
            password_hash="hash_del",
            is_active=True,
            deleted_at=datetime.now(timezone.utc),
        )
        session.add(user_del)
        session.flush()
        session.add(UsuarioRol(usuario_id=user_del.id, rol_codigo="CLIENT"))
        
        session.commit()

    yield
    
    SQLModel.metadata.drop_all(engine)


# ── Tests para creación administrativa de usuarios ───────────────────────────

def test_crear_usuario_administrativo_exitoso():
    payload = {
        "nombre": "Carlos",
        "apellido": "Perez",
        "email": "carlos.encargado@thefoodstore.com",
        "password": "SecurePassword123",
        "roles": ["ENCARGADO"]
    }
    
    response = client.post("/api/v1/usuarios/", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert data["nombre"] == "Carlos"
    assert data["apellido"] == "Perez"
    assert data["email"] == "carlos.encargado@thefoodstore.com"
    assert "ENCARGADO" in data["roles"]
    assert "password_hash" not in data
    
    # Verificar que el usuario se grabó con la clave hasheada y que verify_password funciona
    with Session(engine) as session:
        usuario_db = session.get(Usuario, data["id"])
        assert usuario_db is not None
        assert usuario_db.nombre == "Carlos"
        assert verify_password("SecurePassword123", usuario_db.password_hash)
        
        # Verificar que tiene el rol
        roles = [r.rol_codigo for r in usuario_db.usuario_roles]
        assert "ENCARGADO" in roles


def test_crear_usuario_administrativo_email_duplicado():
    payload = {
        "nombre": "Pedro",
        "apellido": "Gomez",
        "email": "pedro.encargado@test.com",  # Ya existe en el setup
        "password": "Password123",
        "roles": ["ENCARGADO"]
    }
    response = client.post("/api/v1/usuarios/", json=payload)
    assert response.status_code == 409
    assert "email" in response.json()["detail"].lower()


def test_crear_usuario_administrativo_sin_roles():
    payload = {
        "nombre": "Carlos",
        "apellido": "Perez",
        "email": "carlos.perez@test.com",
        "password": "Password123",
        "roles": []
    }
    response = client.post("/api/v1/usuarios/", json=payload)
    assert response.status_code == 400


# ── Tests para listado con filtros de rol y soft delete ───────────────────────

def test_listar_usuarios_sin_filtros():
    response = client.get("/api/v1/usuarios/")
    assert response.status_code == 200
    
    data = response.json()
    # En el setup hay 3 usuarios activos (Admin 1, Pedro 2, Maria 3). El 4 está eliminado.
    assert data["total"] == 3
    assert len(data["items"]) == 3
    
    # Verificar que el eliminado no figure
    emails = [u["email"] for u in data["items"]]
    assert "eliminado@test.com" not in emails


def test_listar_usuarios_incluyendo_eliminados():
    response = client.get("/api/v1/usuarios/?include_deleted=true")
    assert response.status_code == 200
    
    data = response.json()
    # Ahora debe incluir al eliminado (ID 4)
    assert data["total"] == 4
    assert len(data["items"]) == 4
    
    emails = [u["email"] for u in data["items"]]
    assert "eliminado@test.com" in emails


def test_listar_usuarios_filtrado_por_rol():
    response = client.get("/api/v1/usuarios/?rol=ENCARGADO")
    assert response.status_code == 200
    
    data = response.json()
    # Únicamente Pedro (ID 2) es ENCARGADO
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["email"] == "pedro.encargado@test.com"


def test_listar_usuarios_filtrado_por_rol_e_incluyendo_eliminados():
    # El usuario eliminado (ID 4) es CLIENT. Maria (ID 3) es CLIENT.
    response = client.get("/api/v1/usuarios/?rol=CLIENT&include_deleted=true")
    assert response.status_code == 200
    
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    
    emails = [u["email"] for u in data["items"]]
    assert "maria.cliente@test.com" in emails
    assert "eliminado@test.com" in emails


# ── Tests para Soft Delete y auto-protección ──────────────────────────────────

def test_eliminar_usuario_exitoso():
    # Pedro (ID 2) está activo
    response = client.delete("/api/v1/usuarios/2")
    assert response.status_code == 204
    
    # Verificar que ahora está archivado
    with Session(engine) as session:
        usuario_db = session.get(Usuario, 2)
        assert usuario_db is not None
        assert usuario_db.deleted_at is not None
        
    # Verificar que ya no sale en el listado común
    res_list = client.get("/api/v1/usuarios/")
    assert res_list.json()["total"] == 2


def test_eliminar_propia_cuenta_falla():
    # Intenta eliminarse a sí mismo (ID 1)
    response = client.delete("/api/v1/usuarios/1")
    assert response.status_code == 400
    assert "propia cuenta" in response.json()["detail"].lower()


# ── Tests para restauración de usuarios ───────────────────────────────────────

def test_restaurar_usuario_exitoso():
    # El usuario ID 4 está eliminado lógicamente en el setup
    response = client.patch("/api/v1/usuarios/4/restore")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == 4
    assert data["deleted_at"] is None
    assert data["is_active"] is True
    
    # Verificar en la base de datos
    with Session(engine) as session:
        usuario_db = session.get(Usuario, 4)
        assert usuario_db is not None
        assert usuario_db.deleted_at is None
        assert usuario_db.is_active is True
        
    # Debe figurar en el listado normal ahora
    res_list = client.get("/api/v1/usuarios/")
    assert res_list.json()["total"] == 4
