import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from decimal import Decimal

from main import app
from app.core.database import get_session
from app.core.dependencies import get_current_user

# Setup in-memory DB para testeo
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def override_get_session():
    with Session(engine) as session:
        yield session

def override_get_current_user():
    return {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

client = TestClient(app)

@pytest.fixture(autouse=True)
def prepare_db():
    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    SQLModel.metadata.create_all(engine)
    
    # Correr la migración manual en la DB de pruebas
    from app.core.database import migrate_ingredientes_columns
    migrate_ingredientes_columns()
    
    yield
    SQLModel.metadata.drop_all(engine)
    app.dependency_overrides.clear()


def test_crear_ingrediente_con_inventario_completo():
    # 1. Insertamos primero una unidad de medida en la DB
    with Session(engine) as session:
        from app.modules.productos.models import UnidadMedida
        um = UnidadMedida(nombre="Gramos", simbolo="g", tipo="masa")
        session.add(um)
        session.commit()
        session.refresh(um)
        um_id = um.id

    # 2. Creamos ingrediente enlazado
    payload = {
        "nombre": "Harina de Trigo",
        "descripcion": "Harina 000 para panificado",
        "es_alergeno": True,
        "unidad_medida_id": um_id,
        "stock_actual": 12.500,
        "stock_minimo": 5.000,
        "costo_unitario": 120.50
    }
    
    response = client.post("/api/v1/ingredientes/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Harina de Trigo"
    assert data["es_alergeno"] is True
    assert float(data["stock_actual"]) == 12.5
    assert float(data["stock_minimo"]) == 5.0
    assert float(data["costo_unitario"]) == 120.5
    assert data["unidad_medida_id"] == um_id
    assert data["unidad_medida"] is not None
    assert data["unidad_medida"]["simbolo"] == "g"


def test_crear_ingrediente_valores_defecto():
    payload = {
        "nombre": "Agua Mineral",
        "descripcion": "Agua purificada",
        "es_alergeno": False
    }
    
    response = client.post("/api/v1/ingredientes/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Agua Mineral"
    assert float(data["stock_actual"]) == 0.0
    assert float(data["stock_minimo"]) == 0.0
    assert float(data["costo_unitario"]) == 0.0
    assert data["unidad_medida_id"] is None
    assert data["unidad_medida"] is None


def test_actualizar_inventario_ingrediente():
    # 1. Crear ingrediente base
    payload = {
        "nombre": "Queso Rallado",
        "stock_actual": 0.0,
        "stock_minimo": 2.0
    }
    response_create = client.post("/api/v1/ingredientes/", json=payload)
    ing_id = response_create.json()["id"]

    # 2. Actualizar stock y costo
    update_payload = {
        "stock_actual": 15.750,
        "costo_unitario": 450.00
    }
    response_update = client.patch(f"/api/v1/ingredientes/{ing_id}", json=update_payload)
    assert response_update.status_code == 200
    data = response_update.json()
    assert float(data["stock_actual"]) == 15.75
    assert float(data["costo_unitario"]) == 450.0
    assert float(data["stock_minimo"]) == 2.0  # Mantiene valor previo
