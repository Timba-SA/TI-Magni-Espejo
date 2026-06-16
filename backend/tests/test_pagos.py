import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from datetime import datetime
from decimal import Decimal
from unittest.mock import AsyncMock, patch
import hmac
import hashlib

from main import app as fastapi_app
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.core.config import settings

# Importar todos los modelos necesarios
import app.modules.auth.models
import app.modules.usuarios.models
import app.modules.direcciones.models
import app.modules.productos.models
import app.modules.pedidos.models
import app.modules.pagos.models

from app.modules.usuarios.models import Usuario
from app.modules.direcciones.models import DireccionEntrega
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, EstadoPedido, FormaPago
from app.modules.pagos.models import Pago

# Setup in-memory DB para testeo
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

def override_get_session():
    with Session(engine) as session:
        yield session

def override_get_current_user():
    return current_test_user

client = TestClient(fastapi_app)

@pytest.fixture(autouse=True)
def prepare_db():
    # Registrar overrides de forma aislada
    fastapi_app.dependency_overrides[get_session] = override_get_session
    fastapi_app.dependency_overrides[get_current_user] = override_get_current_user
    
    # Inyectar variables de configuración mockeadas para MercadoPago
    settings.MP_ACCESS_TOKEN = "TEST_ACCESS_TOKEN"
    settings.MP_WEBHOOK_SECRET = "TEST_WEBHOOK_SECRET"
    
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # 1. Usuarios
        u1 = Usuario(id=1, nombre="Cliente", apellido="Uno", email="user1@test.com", password_hash="pw")
        u2 = Usuario(id=2, nombre="Admin", apellido="General", email="admin@test.com", password_hash="pw")
        session.add(u1)
        session.add(u2)
        
        # 2. Dirección activa
        d1 = DireccionEntrega(id=1, usuario_id=1, alias="Casa", linea1="Calle 123", ciudad="CABA", es_principal=True)
        session.add(d1)
        
        # 3. Estados de pedido semilla
        estados = [
            EstadoPedido(codigo="PENDIENTE", descripcion="Pendiente de confirmación", orden=1, es_terminal=False),
            EstadoPedido(codigo="CONFIRMADO", descripcion="Confirmado", orden=2, es_terminal=False),
            EstadoPedido(codigo="CANCELADO", descripcion="Cancelado", orden=6, es_terminal=True),
        ]
        for est in estados:
            session.add(est)
            
        # 4. Formas de pago semilla
        formas = [
            FormaPago(codigo="EFECTIVO", descripcion="Pago en Efectivo", habilitado=True),
            FormaPago(codigo="MERCADOPAGO", descripcion="Mercado Pago", habilitado=True),
        ]
        for f in formas:
            session.add(f)
            
        # 5. Pedido semilla
        p1 = Pedido(
            id=1, 
            usuario_id=1, 
            direccion_id=1, 
            estado_codigo="PENDIENTE", 
            forma_pago_codigo="MERCADOPAGO",
            subtotal=Decimal("300.00"),
            costo_envio=Decimal("50.00"),
            total=Decimal("350.00")
        )
        session.add(p1)
        
        session.commit()
        
    yield
    SQLModel.metadata.drop_all(engine)
    fastapi_app.dependency_overrides.clear()


# --- FASE 1: TDD TEST SUITE ---

@patch("httpx.AsyncClient.post", new_callable=AsyncMock)
def test_iniciar_pago_exitoso(mock_post):
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    # Configurar respuesta simulada de la API de MercadoPago
    mock_post.return_value.status_code = 201
    mock_post.return_value.json.return_value = {
        "id": "pref_123456",
        "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_123456"
    }

    payload = {"pedido_id": 1}
    response = client.post("/api/v1/pagos/crear", json=payload)
    
    assert response.status_code == 200 or response.status_code == 201
    data = response.json()
    assert data["preference_id"] == "pref_123456"
    assert "init_point" in data

    # Validar que se creó el registro del pago en estado pending en la base de datos
    with Session(engine) as session:
        pagos_db = session.exec(app.modules.pagos.repository.select(Pago)).all()
        assert len(pagos_db) == 1
        pago = pagos_db[0]
        assert pago.pedido_id == 1
        assert pago.mp_status == "pending"
        assert pago.transaction_amount == Decimal("350.00")
        assert pago.external_reference == "pedido_1"
        assert pago.idempotency_key is not None


@patch("httpx.AsyncClient.post", new_callable=AsyncMock)
def test_iniciar_pago_idempotencia(mock_post, prepare_db):
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    # Insertar primer pago manual en DB
    with Session(engine) as session:
        pago_existente = Pago(
            pedido_id=1,
            mp_status="pending",
            external_reference="pedido_1",
            idempotency_key="idemp_uuid_unique",
            transaction_amount=Decimal("350.00"),
            preference_id="pref_original",
            init_point="https://checkout.mp.com/pref_original"
        )
        session.add(pago_existente)
        session.commit()

    # Segunda llamada para el mismo pedido
    payload = {"pedido_id": 1}
    response = client.post("/api/v1/pagos/crear", json=payload)
    assert response.status_code in (200, 201)
    data = response.json()
    
    # Debe retornar exactamente los datos guardados sin llamar a MercadoPago
    assert data["preference_id"] == "pref_original"
    assert data["init_point"] == "https://checkout.mp.com/pref_original"
    assert not mock_post.called  # Validar que no se llamó a la API de MP

    # Verificar que no se duplicó el registro del pago
    with Session(engine) as session:
        pagos_db = session.exec(app.modules.pagos.repository.select(Pago)).all()
        assert len(pagos_db) == 1


def test_iniciar_pago_pedido_ajeno_forbidden():
    global current_test_user
    # Usuario 2 (Admin) intenta pagar el pedido de Usuario 1
    current_test_user = {"sub": 2, "email": "admin@test.com", "roles": ["CLIENT"]}

    payload = {"pedido_id": 1}
    response = client.post("/api/v1/pagos/crear", json=payload)
    # Debe denegar por no ser el dueño (403 o 404)
    assert response.status_code == 403


@patch("httpx.AsyncClient.get", new_callable=AsyncMock)
def test_webhook_pago_aprobado(mock_get):
    # Insertar pago pending semilla en la DB
    with Session(engine) as session:
        pago = Pago(
            pedido_id=1,
            mp_status="pending",
            external_reference="pedido_1",
            idempotency_key="idemp_1",
            transaction_amount=Decimal("350.00")
        )
        session.add(pago)
        session.commit()

    # Mockear llamada de consulta del pago de MercadoPago
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {
        "id": 999888777,
        "status": "approved",
        "status_detail": "accredited",
        "external_reference": "pedido_1",
        "transaction_amount": 350.00,
        "payment_method_id": "master"
    }

    # Firma X-Signature simulada
    ts = "1684600000"
    manifest = f"id:999888777;ts:{ts}"
    signature = hmac.new(b"TEST_WEBHOOK_SECRET", manifest.encode(), hashlib.sha256).hexdigest()
    headers = {"X-Signature": f"ts={ts},v1={signature}"}

    payload = {
        "action": "payment.created",
        "type": "payment",
        "data": {"id": "999888777"}
    }
    
    response = client.post("/api/v1/pagos/webhook", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    # Verificar que el pago cambió a approved
    with Session(engine) as session:
        pago_db = session.get(Pago, 1)
        assert pago_db.mp_status == "approved"
        assert pago_db.mp_payment_id == 999888777
        assert pago_db.payment_method_id == "master"

        # Verificar que el pedido avanzó de forma atómica a CONFIRMADO
        pedido_db = session.get(Pedido, 1)
        assert pedido_db.estado_codigo == "CONFIRMADO"


@patch("httpx.AsyncClient.get", new_callable=AsyncMock)
def test_webhook_pago_rechazado(mock_get):
    with Session(engine) as session:
        pago = Pago(
            pedido_id=1,
            mp_status="pending",
            external_reference="pedido_1",
            idempotency_key="idemp_2",
            transaction_amount=Decimal("350.00")
        )
        session.add(pago)
        session.commit()

    # Mockear llamada a MercadoPago retornando pago rechazado
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {
        "id": 888777666,
        "status": "rejected",
        "status_detail": "cc_rejected_insufficient_amount",
        "external_reference": "pedido_1",
        "transaction_amount": 350.00,
        "payment_method_id": "visa"
    }

    ts = "1684600000"
    manifest = f"id:888777666;ts:{ts}"
    signature = hmac.new(b"TEST_WEBHOOK_SECRET", manifest.encode(), hashlib.sha256).hexdigest()
    headers = {"X-Signature": f"ts={ts},v1={signature}"}

    payload = {
        "action": "payment.created",
        "type": "payment",
        "data": {"id": "888777666"}
    }

    response = client.post("/api/v1/pagos/webhook", json=payload, headers=headers)
    assert response.status_code == 200

    # Verificar DB
    with Session(engine) as session:
        pago_db = session.get(Pago, 1)
        assert pago_db.mp_status == "rejected"
        assert pago_db.mp_payment_id == 888777666

        # El pedido DEBE seguir en PENDIENTE
        pedido_db = session.get(Pedido, 1)
        assert pedido_db.estado_codigo == "PENDIENTE"


def test_webhook_firma_invalida():
    headers = {"X-Signature": "ts=123,v1=badhash"}
    payload = {
        "action": "payment.created",
        "type": "payment",
        "data": {"id": "111222333"}
    }

    response = client.post("/api/v1/pagos/webhook", json=payload, headers=headers)
    assert response.status_code == 401 or response.status_code == 403
