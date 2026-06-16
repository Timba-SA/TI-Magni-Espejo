import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel, select
from sqlmodel.pool import StaticPool
from decimal import Decimal
from datetime import datetime, timezone

from main import app
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.modules.productos.models import Producto, UnidadMedida
from app.modules.ingredientes.models import Ingrediente

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
    
    # Insertar datos semilla para pruebas
    with Session(engine) as session:
        # 1. Unidad de medida
        um = UnidadMedida(id=1, nombre="Gramos", simbolo="g", tipo="masa")
        session.add(um)
        session.flush()
        
        # 2. Insumo/Ingrediente real
        ing = Ingrediente(
            id=1,
            nombre="Queso Muzza",
            descripcion="Muzzarella premium",
            es_alergeno=True,
            is_active=True,
            unidad_medida_id=1,
            stock_actual=Decimal("10.000"),
            stock_minimo=Decimal("2.000"),
            costo_unitario=Decimal("5.50"),
        )
        session.add(ing)
        session.flush()
        
        # 3. Producto activo
        prod_activo = Producto(
            id=1,
            nombre="Pizza Muzza",
            descripcion="Pizza clásica",
            precio_base=Decimal("120.00"),
            imagenes_url=[],
            stock_cantidad=5,
            disponible=True
        )
        session.add(prod_activo)
        
        # 4. Producto archivado (soft-deleted)
        prod_archivado = Producto(
            id=2,
            nombre="Fugazzeta",
            descripcion="Pizza con cebolla",
            precio_base=Decimal("130.00"),
            imagenes_url=[],
            stock_cantidad=3,
            disponible=True,
            deleted_at=datetime.now(timezone.utc)
        )
        session.add(prod_archivado)
        session.commit()
        
    yield
    SQLModel.metadata.drop_all(engine)
    app.dependency_overrides.clear()


def test_reactivar_producto_satisfactorio():
    """
    Un administrador o encargado puede reactivar un producto archivado con éxito.
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    response = client.patch("/api/v1/productos/2/reactivar")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == 2
    assert data["deleted_at"] is None

    # Verificar en base de datos directa
    with Session(engine) as session:
        db_prod = session.get(Producto, 2)
        assert db_prod.deleted_at is None


def test_reactivar_producto_inexistente_returns_404():
    """
    Intentar reactivar un producto que no existe devuelve 404.
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    response = client.patch("/api/v1/productos/9999/reactivar")
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"].lower()


def test_reactivar_producto_unauthorized_for_client():
    """
    Un usuario con rol CLIENT recibe 403 Forbidden al intentar reactivar.
    """
    global current_test_user
    current_test_user = {"sub": 3, "email": "client@test.com", "roles": ["CLIENT"]}

    response = client.patch("/api/v1/productos/2/reactivar")
    assert response.status_code == 403
    assert "roles" in response.json()["detail"].lower()


def test_crear_producto_con_insumos_reales():
    """
    Crear un producto asociándole ingredientes/insumos reales.
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    payload = {
        "nombre": "Pizza Especial",
        "descripcion": "Pizza con jamón y morrones",
        "precio_base": 150.00,
        "imagenes_url": [],
        "stock_cantidad": 10,
        "disponible": True,
        "categorias": [{"categoria_id": 1, "es_principal": True}],
        "ingredientes": [
            {
                "ingrediente_id": 1,
                "cantidad": 150.000,
                "unidad_medida_id": 1,
                "es_removible": True
            }
        ]
    }

    # Nota: Como las categorías de prueba se validan en ProductoService,
    # debemos burlar o insertar una categoría con ID=1 en el setup
    with Session(engine) as session:
        from app.modules.categorias.models import Categoria
        cat = Categoria(id=1, nombre="Pizzas", descripcion="Pizzas caseras", is_active=True)
        session.add(cat)
        session.commit()

    response = client.post("/api/v1/productos/", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["nombre"] == "Pizza Especial"

    # Verificar que las relaciones se insertaron correctamente
    with Session(engine) as session:
        from app.modules.productos.models import ProductoIngrediente
        # Buscar la relación de ingredientes del nuevo producto
        pi_list = session.exec(select(ProductoIngrediente).where(ProductoIngrediente.producto_id == data["id"])).all()
        assert len(pi_list) == 1
        assert pi_list[0].ingrediente_id == 1
        assert pi_list[0].cantidad == Decimal("150.000")
        assert pi_list[0].es_removible is True


def test_crear_producto_con_insumo_inexistente_returns_404():
    """
    Intentar crear un producto asociando un ingrediente que no existe devuelve 404.
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    with Session(engine) as session:
        from app.modules.categorias.models import Categoria
        cat = Categoria(id=1, nombre="Pizzas", descripcion="Pizzas caseras", is_active=True)
        session.add(cat)
        session.commit()

    payload = {
        "nombre": "Pizza Extraña",
        "descripcion": "Pizza con ingrediente fantasma",
        "precio_base": 150.00,
        "imagenes_url": [],
        "stock_cantidad": 10,
        "disponible": True,
        "categorias": [{"categoria_id": 1, "es_principal": True}],
        "ingredientes": [
            {
                "ingrediente_id": 9999,
                "cantidad": 100.000,
                "unidad_medida_id": 1,
                "es_removible": True
            }
        ]
    }

    response = client.post("/api/v1/productos/", json=payload)
    assert response.status_code == 404
    assert "ingrediente con id=9999 no encontrado" in response.json()["detail"].lower()


def test_actualizar_producto_con_ingredientes_y_categorias():
    """
    Actualizar un producto modificando sus datos básicos, categorías e ingredientes.
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    # Insertar categoría 2 e ingrediente 2 en BD
    with Session(engine) as session:
        from app.modules.categorias.models import Categoria
        from app.modules.ingredientes.models import Ingrediente
        
        cat2 = Categoria(id=2, nombre="Empanadas", descripcion="Empanadas caseras", is_active=True)
        session.add(cat2)
        
        ing2 = Ingrediente(
            id=2,
            nombre="Jamón",
            descripcion="Jamón cocido",
            es_alergeno=False,
            is_active=True,
            unidad_medida_id=1,
            stock_actual=Decimal("5.000"),
            stock_minimo=Decimal("1.000"),
            costo_unitario=Decimal("0.70"),
        )
        session.add(ing2)
        session.commit()

    payload = {
        "nombre": "Pizza Muzza Editada",
        "precio_base": 140.00,
        "categorias": [{"categoria_id": 2, "es_principal": True}],
        "ingredientes": [
            {
                "ingrediente_id": 2,
                "cantidad": 200.000,
                "unidad_medida_id": 1,
                "es_removible": False
            }
        ]
    }

    response = client.put("/api/v1/productos/1", json=payload)
    assert response.status_code == 200

    # Verificar en base de datos directa
    with Session(engine) as session:
        from app.modules.productos.models import Producto, ProductoCategoria, ProductoIngrediente
        db_prod = session.get(Producto, 1)
        assert db_prod.nombre == "Pizza Muzza Editada"
        assert db_prod.precio_base == Decimal("140.00")

        # Categorías asociadas
        cats = session.exec(select(ProductoCategoria).where(ProductoCategoria.producto_id == 1)).all()
        assert len(cats) == 1
        assert cats[0].categoria_id == 2
        assert cats[0].es_principal is True

        # Ingredientes asociados
        ings = session.exec(select(ProductoIngrediente).where(ProductoIngrediente.producto_id == 1)).all()
        assert len(ings) == 1
        assert ings[0].ingrediente_id == 2
        assert ings[0].cantidad == Decimal("200.000")
        assert ings[0].es_removible is False

