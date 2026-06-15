"""
conftest.py — Fixtures compartidas para todos los tests de The Food Store.

Proporciona:
  - engine / db_session: base de datos SQLite en memoria, aislada por test.
  - client: TestClient con overrides de dependencias FastAPI.
  - admin_headers / client_headers / pedidos_headers: tokens JWT por rol.
  - producto_factory / pedido_factory: helpers de creación de datos de prueba.
"""

import pytest
from decimal import Decimal
from datetime import datetime

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import ARRAY

from main import app
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.modules.usuarios.models import Usuario, Rol, UsuarioRol
from app.modules.productos.models import Producto, CategoriaProducto
from app.modules.pedidos.models import (
    Pedido, DetallePedido, EstadoPedido, FormaPago,
)


# ── SQLite: compatibilidad con el tipo ARRAY de PostgreSQL ────────────────────

@compiles(ARRAY, "sqlite")
def _compile_array_sqlite(type_, compiler, **kw):
    return "TEXT"


# ── Engine en memoria — uno por test para aislamiento total ──────────────────
# SQLAlchemy 2.x eliminó Session(bind=connection), por lo que la estrategia más
# robusta es crear un engine+schema fresh por cada test function.
# Con StaticPool + SQLite in-memory el overhead es mínimo.

@pytest.fixture()
def engine():
    _engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(_engine)
    yield _engine
    SQLModel.metadata.drop_all(_engine)
    _engine.dispose()


# ── Sesión de base de datos aislada por test ──────────────────────────────────

@pytest.fixture()
def db_session(engine):
    """Sesión limpia por test. SQLAlchemy 2.x: Session(engine) es la API correcta."""
    with Session(engine) as session:
        yield session
        session.rollback()


# ── Cliente HTTP con overrides de dependencias ────────────────────────────────

@pytest.fixture()
def client(db_session):
    def _override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = _override_get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── Helpers: payloads JWT por rol ─────────────────────────────────────────────

def _make_payload(user_id: int, roles: list[str]) -> dict:
    return {"sub": str(user_id), "roles": roles, "email": f"user{user_id}@test.com"}


def _auth_headers(user_id: int, roles: list[str]) -> dict:
    token = create_access_token(_make_payload(user_id, roles))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_headers() -> dict:
    return _auth_headers(1, ["ADMIN"])


@pytest.fixture()
def client_headers() -> dict:
    return _auth_headers(2, ["CLIENTE"])


@pytest.fixture()
def pedidos_headers() -> dict:
    """Rol PEDIDOS — puede transicionar estados de pedido."""
    return _auth_headers(3, ["PEDIDOS"])


# ── Factory: Producto ─────────────────────────────────────────────────────────

@pytest.fixture()
def producto_factory(db_session: Session):
    """
    Devuelve una función callable para crear Producto en la DB de test.

    Uso:
        prod = producto_factory(nombre="Milanesa", precio=Decimal("800.00"))
    """
    _counter = {"n": 0}

    def _create(
        nombre: str | None = None,
        precio: Decimal = Decimal("500.00"),
        descripcion: str = "Descripción de prueba",
        disponible: bool = True,
        stock: int | None = None,
    ) -> Producto:
        _counter["n"] += 1
        n = _counter["n"]

        producto = Producto(
            nombre=nombre or f"Producto Test {n}",
            descripcion=descripcion,
            precio=precio,
            disponible=disponible,
            deleted_at=None,
        )
        db_session.add(producto)
        db_session.commit()
        db_session.refresh(producto)
        return producto

    return _create


# ── Factory: Pedido ───────────────────────────────────────────────────────────

@pytest.fixture()
def pedido_factory(db_session: Session):
    """
    Devuelve una función callable para crear Pedido + DetallePedido en la DB de test.

    Uso:
        pedido = pedido_factory(
            usuario_id=2,
            estado_codigo="ENTREGADO",
            detalles=[{"producto_id": 1, "cantidad": 2, "precio": Decimal("500")}],
        )
    """
    _counter = {"n": 0}

    def _create(
        usuario_id: int = 2,
        estado_codigo: str = "PENDIENTE",
        forma_pago_codigo: str = "EFECTIVO",
        subtotal: Decimal = Decimal("500.00"),
        descuento: Decimal = Decimal("0.00"),
        costo_envio: Decimal = Decimal("0.00"),
        total: Decimal | None = None,
        created_at: datetime | None = None,
        detalles: list[dict] | None = None,
    ) -> Pedido:
        _counter["n"] += 1
        _total = total if total is not None else subtotal - descuento + costo_envio

        pedido = Pedido(
            usuario_id=usuario_id,
            estado_codigo=estado_codigo,
            forma_pago_codigo=forma_pago_codigo,
            subtotal=subtotal,
            descuento=descuento,
            costo_envio=costo_envio,
            total=_total,
            created_at=created_at or datetime.utcnow(),
            deleted_at=None,
        )
        db_session.add(pedido)
        db_session.flush()  # obtener pedido.id antes de los detalles

        for det in (detalles or []):
            detalle = DetallePedido(
                pedido_id=pedido.id,
                producto_id=det.get("producto_id", 1),
                cantidad=det.get("cantidad", 1),
                nombre_snapshot=det.get("nombre_snapshot", "Producto"),
                precio_snapshot=det.get("precio", Decimal("500.00")),
                subtotal_snap=det.get("precio", Decimal("500.00")) * det.get("cantidad", 1),
                personalizacion=det.get("personalizacion", None),
            )
            db_session.add(detalle)

        db_session.commit()
        db_session.refresh(pedido)
        return pedido

    return _create
