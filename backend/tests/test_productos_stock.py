import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from decimal import Decimal

from main import app
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.modules.productos.models import Producto

# Setup in-memory DB para testeo
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

# Usuario autenticado simulado dinámicamente para los tests
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
    
    # Insertar un producto semilla de prueba
    with Session(engine) as session:
        prod = Producto(
            id=1,
            nombre="Pizza Muzza",
            descripcion="Pizza clásica",
            precio_base=Decimal("120.00"),
            imagenes_url=[],
            stock_cantidad=5,
            disponible=True
        )
        session.add(prod)
        session.commit()
        
    yield
    SQLModel.metadata.drop_all(engine)
    app.dependency_overrides.clear()


def test_actualizar_stock_y_disponibilidad_admin_satisfactorio():
    """
    Escenario 1: Un administrador puede actualizar el stock y la disponibilidad con éxito.
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    payload = {
        "stock_cantidad": 25,
        "disponible": False
    }
    response = client.patch("/api/v1/productos/1/disponibilidad", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["stock_cantidad"] == 25
    assert data["disponible"] is False

    # Validar persistencia en base de datos directa
    with Session(engine) as session:
        db_prod = session.get(Producto, 1)
        assert db_prod.stock_cantidad == 25
        assert db_prod.disponible is False


def test_actualizar_stock_y_disponibilidad_stock_operator_satisfactorio():
    """
    Escenario 1 (bis): Un operador con rol STOCK puede actualizar el stock con éxito.
    """
    global current_test_user
    current_test_user = {"sub": 2, "email": "operator@test.com", "roles": ["STOCK"]}

    payload = {
        "stock_cantidad": 10
    }
    response = client.patch("/api/v1/productos/1/disponibilidad", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["stock_cantidad"] == 10
    # El campo disponible debe seguir intacto
    assert data["disponible"] is True


def test_actualizar_disponibilidad_cliente_forbidden():
    """
    Escenario 2: Un usuario con rol CLIENT recibe 403 Forbidden.
    """
    global current_test_user
    current_test_user = {"sub": 3, "email": "client@test.com", "roles": ["CLIENT"]}

    payload = {
        "stock_cantidad": 10,
        "disponible": False
    }
    response = client.patch("/api/v1/productos/1/disponibilidad", json=payload)
    assert response.status_code == 403
    assert "roles" in response.json()["detail"].lower()

    # Validar que los datos de stock sigan intactos
    with Session(engine) as session:
        db_prod = session.get(Producto, 1)
        assert db_prod.stock_cantidad == 5
        assert db_prod.disponible is True


def test_actualizar_stock_negativo_validation_error():
    """
    Escenario 3: Un valor de stock negativo es inválido (ge=0 en esquema).
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    payload = {
        "stock_cantidad": -10
    }
    response = client.patch("/api/v1/productos/1/disponibilidad", json=payload)
    # Debe ser capturado por la validación de Pydantic
    assert response.status_code in [400, 422]


def test_actualizar_producto_inexistente_not_found():
    """
    Escenario 4: Intentar actualizar un producto inexistente devuelve 404.
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    payload = {
        "stock_cantidad": 10
    }
    response = client.patch("/api/v1/productos/9999/disponibilidad", json=payload)
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()
