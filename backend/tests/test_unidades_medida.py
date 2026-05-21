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

# Compilador de ARRAY para SQLite (para el campo imagenes_url en Producto)
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import ARRAY

@compiles(ARRAY, "sqlite")
def compile_array_sqlite(type_, compiler, **kw):
    return "TEXT"


def override_get_session():
    with Session(engine) as session:
        yield session

def override_get_current_user():
    return {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

client = TestClient(app)

@pytest.fixture(autouse=True)
def prepare_db():
    # Registrar overrides de forma aislada para este set de tests
    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)
    
    # Limpiar overrides al finalizar para no interferir con otros tests
    app.dependency_overrides.clear()


def test_crear_unidad_medida_satisfactorio():
    payload = {
        "nombre": "Kilogramo",
        "simbolo": "kg",
        "tipo": "masa"
    }
    response = client.post("/api/v1/unidades-medida/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Kilogramo"
    assert data["simbolo"] == "kg"
    assert data["tipo"] == "masa"
    assert "id" in data


def test_crear_unidad_medida_duplicada():
    # Insertamos la primera unidad directamente en la DB
    with Session(engine) as session:
        from app.modules.productos.models import UnidadMedida
        session.add(UnidadMedida(nombre="Kilogramo", simbolo="kg", tipo="masa"))
        session.commit()

    payload = {
        "nombre": "Otro Kilo",
        "simbolo": "kg", # Duplicado por símbolo
        "tipo": "masa"
    }
    response = client.post("/api/v1/unidades-medida/", json=payload)
    assert response.status_code == 400
    assert "ya existe" in response.json()["detail"].lower()


def test_crear_producto_con_unidad_venta_valida():
    # Insertar unidad y categoría en la DB
    with Session(engine) as session:
        from app.modules.productos.models import UnidadMedida
        from app.modules.categorias.models import Categoria
        um = UnidadMedida(nombre="Kilogramo", simbolo="kg", tipo="masa")
        cat = Categoria(nombre="Lácteos", descripcion="Productos lácteos")
        session.add(um)
        session.add(cat)
        session.commit()
        session.refresh(um)
        session.refresh(cat)
        um_id = um.id
        cat_id = cat.id

    # Creamos un producto enlazado a la unidad de venta
    payload = {
        "nombre": "Queso Dambo",
        "descripcion": "Queso dambo de primera calidad",
        "precio_base": 12.50,
        "imagenes_url": [],
        "stock_cantidad": 10,
        "disponible": True,
        "unidad_venta_id": um_id,
        "categorias": [{"categoria_id": cat_id, "es_principal": True}]
    }
    response = client.post("/api/v1/productos/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Queso Dambo"
    assert data["unidad_venta_id"] == um_id
    assert "unidad_venta" in data
    assert data["unidad_venta"]["simbolo"] == "kg"


def test_crear_producto_con_unidad_venta_inexistente():
    # Necesitamos una categoría válida para que el producto no falle por esa regla
    with Session(engine) as session:
        from app.modules.categorias.models import Categoria
        cat = Categoria(nombre="Genérico", descripcion="Categoría de prueba")
        session.add(cat)
        session.commit()
        session.refresh(cat)
        cat_id = cat.id

    payload = {
        "nombre": "Producto Invalido",
        "descripcion": "Sin unidad real",
        "precio_base": 5.00,
        "imagenes_url": [],
        "stock_cantidad": 5,
        "disponible": True,
        "unidad_venta_id": 9999,  # ID que no existe
        "categorias": [{"categoria_id": cat_id, "es_principal": True}]
    }
    response = client.post("/api/v1/productos/", json=payload)
    # Debe ser capturado y retornar 400 Bad Request
    assert response.status_code in [400, 422]
    assert "unidad de venta" in response.json()["detail"].lower()


def test_asociar_ingrediente_con_unidad_y_cantidad_valida():
    # Insertar unidad e ingrediente en la DB
    with Session(engine) as session:
        from app.modules.productos.models import UnidadMedida
        from app.modules.ingredientes.models import Ingrediente
        from app.modules.productos.models import Producto

        um = UnidadMedida(nombre="Gramo", simbolo="g", tipo="masa")
        ing = Ingrediente(nombre="Tomate", descripcion="Tomate fresco", es_alergeno=False)
        prod = Producto(nombre="Pizza Margarita", precio_base=150.00, imagenes_url=[], stock_cantidad=20, disponible=True)
        
        session.add(um)
        session.add(ing)
        session.add(prod)
        session.commit()
        
        session.refresh(um)
        session.refresh(ing)
        session.refresh(prod)
        
        um_id = um.id
        ing_id = ing.id
        prod_id = prod.id

    # Asociar ingrediente al producto
    payload = {
        "producto_id": prod_id,
        "ingrediente_id": ing_id,
        "cantidad": 150.000,
        "unidad_medida_id": um_id,
        "es_removible": True
    }
    response = client.post(f"/api/v1/productos/{prod_id}/ingredientes", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert float(data["cantidad"]) == 150.000
    assert data["unidad_medida_id"] == um_id
    assert data["es_removible"] is True


def test_asociar_ingrediente_con_cantidad_invalida():
    with Session(engine) as session:
        from app.modules.productos.models import UnidadMedida
        from app.modules.ingredientes.models import Ingrediente
        from app.modules.productos.models import Producto

        um = UnidadMedida(nombre="Gramo", simbolo="g", tipo="masa")
        ing = Ingrediente(nombre="Tomate", descripcion="Tomate fresco", es_alergeno=False)
        prod = Producto(nombre="Pizza Margarita", precio_base=150.00, imagenes_url=[], stock_cantidad=20, disponible=True)
        
        session.add(um)
        session.add(ing)
        session.add(prod)
        session.commit()
        
        session.refresh(um)
        session.refresh(ing)
        session.refresh(prod)
        
        um_id = um.id
        ing_id = ing.id
        prod_id = prod.id

    # Caso 1: Cantidad <= 0
    payload = {
        "producto_id": prod_id,
        "ingrediente_id": ing_id,
        "cantidad": -10.00, # Invalido
        "unidad_medida_id": um_id,
        "es_removible": True
    }
    response = client.post(f"/api/v1/productos/{prod_id}/ingredientes", json=payload)
    assert response.status_code in [400, 422]
