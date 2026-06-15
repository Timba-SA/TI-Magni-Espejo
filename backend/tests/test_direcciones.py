import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from datetime import datetime

from main import app as fastapi_app
from app.core.database import get_session
from app.core.dependencies import get_current_user

# Importar todos los modelos necesarios para asegurar el registro en metadata
import app.modules.auth.models
import app.modules.usuarios.models
import app.modules.direcciones.models
from app.modules.usuarios.models import Usuario
from app.modules.direcciones.models import DireccionEntrega

# Setup in-memory DB para testeo
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Variable para simular el usuario autenticado dinámicamente
current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

def override_get_session():
    with Session(engine) as session:
        yield session

def override_get_current_user():
    return current_test_user

client = TestClient(fastapi_app)

@pytest.fixture(autouse=True)
def prepare_db():
    # Registrar overrides de forma aislada para esta suite de tests
    fastapi_app.dependency_overrides[get_session] = override_get_session
    fastapi_app.dependency_overrides[get_current_user] = override_get_current_user
    
    SQLModel.metadata.create_all(engine)
    
    # Crear usuarios de prueba básicos en la DB
    with Session(engine) as session:
        u1 = Usuario(id=1, nombre="User", apellido="One", email="user1@test.com", password_hash="pw")
        u2 = Usuario(id=2, nombre="User", apellido="Two", email="user2@test.com", password_hash="pw")
        session.add(u1)
        session.add(u2)
        session.commit()
        
    yield
    SQLModel.metadata.drop_all(engine)
    
    # Limpiar overrides al finalizar para no interferir con otras suites
    fastapi_app.dependency_overrides.clear()


def test_crear_direccion_primera_es_principal():
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    payload = {
        "alias": "Casa",
        "linea1": "Av. Siempreviva 742",
        "linea2": "Piso 1 Depto B",
        "ciudad": "Springfield",
        "provincia": "Oregon",
        "codigo_postal": "8000"
    }
    
    response = client.post("/api/v1/direcciones/", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["alias"] == "Casa"
    assert data["linea1"] == "Av. Siempreviva 742"
    assert data["es_principal"] is True  # Primera dirección del usuario -> Principal automática
    assert data["usuario_id"] == 1
    assert "id" in data


def test_crear_direccion_segunda_no_es_principal():
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    # Insertamos la primera dirección directamente
    with Session(engine) as session:
        session.add(DireccionEntrega(usuario_id=1, alias="Casa", linea1="Calle 1", ciudad="Ciudad 1", es_principal=True))
        session.commit()

    payload = {
        "alias": "Trabajo",
        "linea1": "Av. Corrientes 1234",
        "ciudad": "CABA",
        "provincia": "Buenos Aires",
        "codigo_postal": "1000"
    }
    
    response = client.post("/api/v1/direcciones/", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["alias"] == "Trabajo"
    assert data["es_principal"] is False  # Segunda dirección -> No es principal por defecto


def test_cambiar_direccion_principal_alternancia():
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    # Insertamos dos direcciones: A (principal) y B (secundaria)
    with Session(engine) as session:
        dir_a = DireccionEntrega(usuario_id=1, alias="Casa", linea1="Calle 1", ciudad="Ciudad 1", es_principal=True)
        dir_b = DireccionEntrega(usuario_id=1, alias="Trabajo", linea1="Calle 2", ciudad="Ciudad 1", es_principal=False)
        session.add(dir_a)
        session.add(dir_b)
        session.commit()
        session.refresh(dir_a)
        session.refresh(dir_b)
        id_b = dir_b.id

    # Hacemos principal la dirección B
    response = client.patch(f"/api/v1/direcciones/{id_b}/principal")
    assert response.status_code == 200
    data = response.json()
    assert data["es_principal"] is True

    # Verificamos en DB que la dirección A haya quedado desmarcada de principal
    with Session(engine) as session:
        db_dir_a = session.get(DireccionEntrega, dir_a.id)
        db_dir_b = session.get(DireccionEntrega, id_b)
        assert db_dir_a.es_principal is False
        assert db_dir_b.es_principal is True


def test_manipular_direccion_ajena_forbidden():
    global current_test_user
    
    # Insertar dirección perteneciente al Usuario 2
    with Session(engine) as session:
        dir_u2 = DireccionEntrega(usuario_id=2, alias="Casa U2", linea1="Calle U2", ciudad="Ciudad 2", es_principal=True)
        session.add(dir_u2)
        session.commit()
        session.refresh(dir_u2)
        id_u2 = dir_u2.id

    # Intentar modificarla estando autenticados como Usuario 1
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}
    
    payload = {
        "linea1": "Calle Hackeada",
        "ciudad": "Ciudad Hackeada"
    }
    
    # 1. Modificar
    response = client.put(f"/api/v1/direcciones/{id_u2}", json=payload)
    assert response.status_code == 403

    # 2. Hacer principal
    response = client.patch(f"/api/v1/direcciones/{id_u2}/principal")
    assert response.status_code == 403

    # 3. Eliminar
    response = client.delete(f"/api/v1/direcciones/{id_u2}")
    assert response.status_code == 403


def test_soft_delete_direccion():
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    # Insertar dirección del Usuario 1
    with Session(engine) as session:
        dir_del = DireccionEntrega(usuario_id=1, alias="Temporal", linea1="Borrar", ciudad="Ciudad", es_principal=True)
        session.add(dir_del)
        session.commit()
        session.refresh(dir_del)
        id_del = dir_del.id

    # Eliminar
    response = client.delete(f"/api/v1/direcciones/{id_del}")
    assert response.status_code == 204

    # Verificar que no figure en el listado normal
    response = client.get("/api/v1/direcciones/")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 0

    # Verificar físicamente en la DB que el campo deleted_at tiene valor
    with Session(engine) as session:
        db_dir = session.get(DireccionEntrega, id_del)
        assert db_dir is not None
        assert db_dir.deleted_at is not None


def test_eliminar_direccion_con_pedidos_activos():
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    # Insertar dirección
    with Session(engine) as session:
        dir_pedido = DireccionEntrega(usuario_id=1, alias="Activa", linea1="Direccion", ciudad="Ciudad", es_principal=True)
        session.add(dir_pedido)
        session.commit()
        session.refresh(dir_pedido)
        direccion_id = dir_pedido.id

    # Para este test simulamos la existencia de un pedido activo.
    # En nuestro Service/Router utilizaremos un flag o buscaremos pedidos activos (placeholder mockeable).
    # Como el modelo de pedidos no está creado, agregamos un parámetro de consulta temporal o
    # configuramos el mock del servicio durante el test si lo requerimos.
    # Para ser pragmáticos en TDD, simularemos pedidos activos enviando un header o query param especial
    # (ej: `?mock_active_orders=true`) para forzar la validación en el service y el retorno de 409.
    
    response = client.delete(f"/api/v1/direcciones/{direccion_id}?mock_active_orders=true")
    assert response.status_code == 409
    assert "pedidos activos" in response.json()["detail"].lower()
