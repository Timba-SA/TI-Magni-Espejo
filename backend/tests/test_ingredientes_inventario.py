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


def test_crear_ingrediente_con_peso():
    # Creamos ingrediente con campo peso
    payload = {
        "nombre": "Queso Muzzarella",
        "stock_actual": 10.0,
        "stock_minimo": 2.0,
        "costo_unitario": 100.0,
        "peso": 0.500
    }
    response = client.post("/api/v1/ingredientes/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert float(data["peso"]) == 0.5
    
    # Comprobar actualización de peso
    update_payload = {"peso": 0.750}
    response_update = client.patch(f"/api/v1/ingredientes/{data['id']}", json=update_payload)
    assert response_update.status_code == 200
    assert float(response_update.json()["peso"]) == 0.75


def test_toggle_active_sincroniza_deleted_at():
    # 1. Crear ingrediente
    payload = {
        "nombre": "Tomate Triturado",
        "stock_actual": 5.0
    }
    response = client.post("/api/v1/ingredientes/", json=payload)
    assert response.status_code == 201
    ing_id = response.json()["id"]
    assert response.json()["is_active"] is True
    assert response.json()["deleted_at"] is None

    # 2. Desactivar (toggle-active)
    response_toggle = client.patch(f"/api/v1/ingredientes/{ing_id}/toggle-active")
    assert response_toggle.status_code == 200
    data_inactivo = response_toggle.json()
    assert data_inactivo["is_active"] is False
    assert data_inactivo["deleted_at"] is not None

    # 3. Reactivar (toggle-active)
    response_reactivar = client.patch(f"/api/v1/ingredientes/{ing_id}/toggle-active")
    assert response_reactivar.status_code == 200
    data_activo = response_reactivar.json()
    assert data_activo["is_active"] is True
    assert data_activo["deleted_at"] is None


def test_listado_ingredientes_oculta_inactivos_por_defecto():
    # 1. Crear ingrediente activo y otro que luego desactivamos
    client.post("/api/v1/ingredientes/", json={"nombre": "Sal fina"})
    resp_inactivo = client.post("/api/v1/ingredientes/", json={"nombre": "Pimienta negra"})
    ing_inactivo_id = resp_inactivo.json()["id"]
    client.patch(f"/api/v1/ingredientes/{ing_inactivo_id}/toggle-active")

    # 2. Listar por defecto (oculta inactivos)
    response_default = client.get("/api/v1/ingredientes/")
    assert response_default.status_code == 200
    items_default = response_default.json()["items"]
    nombres_default = [item["nombre"] for item in items_default]
    assert "Sal fina" in nombres_default
    assert "Pimienta negra" not in nombres_default

    # 3. Listar incluyendo inactivos
    response_with_inactivos = client.get("/api/v1/ingredientes/?incluir_inactivos=true")
    assert response_with_inactivos.status_code == 200
    items_all = response_with_inactivos.json()["items"]
    nombres_all = [item["nombre"] for item in items_all]
    assert "Sal fina" in nombres_all
    assert "Pimienta negra" in nombres_all


def test_eliminar_ingrediente_hace_soft_delete_y_oculta():
    # 1. Crear un ingrediente activo
    payload = {"nombre": "Orégano seco", "stock_actual": 10.0}
    response_create = client.post("/api/v1/ingredientes/", json=payload)
    assert response_create.status_code == 201
    ing_id = response_create.json()["id"]
    
    # 2. Eliminar (DELETE)
    response_delete = client.delete(f"/api/v1/ingredientes/{ing_id}")
    assert response_delete.status_code == 204  # status.HTTP_204_NO_CONTENT
    # Nota: la respuesta de DELETE devuelve 204 sin contenido
    
    # 3. Listar por defecto (debe ocultarlo)
    response_list = client.get("/api/v1/ingredientes/")
    assert response_list.status_code == 200
    items = response_list.json()["items"]
    nombres = [item["nombre"] for item in items]
    assert "Orégano seco" not in nombres
    
    # 4. Listar con incluir_inactivos=true (debe mostrarlo con is_active=False y deleted_at!=None)
    response_list_all = client.get("/api/v1/ingredientes/?incluir_inactivos=true")
    assert response_list_all.status_code == 200
    items_all = response_list_all.json()["items"]
    oregano = next(item for item in items_all if item["id"] == ing_id)
    assert oregano["is_active"] is False
    assert oregano["deleted_at"] is not None


