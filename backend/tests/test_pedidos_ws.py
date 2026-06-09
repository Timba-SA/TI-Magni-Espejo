import pytest
from fastapi.testclient import TestClient
from fastapi import WebSocketDisconnect
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from datetime import datetime

from main import app as fastapi_app
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.core.ws_manager import ws_manager
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.models import Pedido, EstadoPedido, FormaPago
from app.modules.pedidos.service import PedidoService
from app.modules.pedidos.schemas import AvanzarEstadoRequest

# Setup base de datos en memoria para testeo de WebSockets
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

def override_get_session():
    with Session(engine) as session:
        yield session

client = TestClient(fastapi_app)

@pytest.fixture(autouse=True)
def prepare_db():
    fastapi_app.dependency_overrides[get_session] = override_get_session
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Usuarios semilla
        u1 = Usuario(id=1, nombre="Cliente1", apellido="Test", email="user1@test.com", password_hash="pw")
        u2 = Usuario(id=2, nombre="Cliente2", apellido="Test", email="user2@test.com", password_hash="pw")
        u3 = Usuario(id=3, nombre="Admin", apellido="Test", email="admin@test.com", password_hash="pw")
        session.add_all([u1, u2, u3])
        
        # Formas de Pago
        fp1 = FormaPago(codigo="EFECTIVO", nombre="Efectivo", descripcion="Efectivo", habilitada=True)
        session.add(fp1)
        
        # Estados para la FSM
        e1 = EstadoPedido(codigo="PENDIENTE", nombre="Pendiente", descripcion="P", orden=1, es_terminal=False)
        e2 = EstadoPedido(codigo="CONFIRMADO", nombre="Confirmado", descripcion="C", orden=2, es_terminal=False)
        e3 = EstadoPedido(codigo="CANCELADO", nombre="Cancelado", descripcion="X", orden=3, es_terminal=True)
        session.add_all([e1, e2, e3])
        
        # Pedido para pruebas
        p1 = Pedido(
            id=10,
            usuario_id=1,
            forma_pago_codigo="EFECTIVO",
            estado_codigo="PENDIENTE",
            subtotal=100.0,
            costo_envio=0.0,
            descuento=0.0,
            total=100.0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(p1)
        session.commit()
        
    yield
    SQLModel.metadata.drop_all(engine)

def test_websocket_handshake_sin_token():
    """Verifica que el handshake se rechaza si no hay token."""
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect("/ws/pedidos") as websocket:
            websocket.receive_text()
    assert exc_info.value.code == 1008

def test_websocket_handshake_token_invalido():
    """Verifica que el handshake se rechaza con un token inválido."""
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect("/ws/pedidos?token=token_invalido") as websocket:
            websocket.receive_text()
    assert exc_info.value.code == 4001

def test_websocket_handshake_token_valido():
    """Verifica que el handshake sea exitoso con un token válido."""
    token = create_access_token({"sub": "1", "email": "user1@test.com", "roles": ["CLIENT"]})
    with client.websocket_connect(f"/ws/pedidos?token={token}") as websocket:
        websocket.send_text("ping")
        resp = websocket.receive_text()
        assert resp == "pong"

def test_websocket_suscripcion_pedido_exitoso_propietario():
    """Verifica que el dueño del pedido pueda conectarse a la sala del pedido."""
    token = create_access_token({"sub": "1", "email": "user1@test.com", "roles": ["CLIENT"]})
    with client.websocket_connect(f"/ws/pedidos?token={token}&pedido_id=10") as websocket:
        websocket.send_text("ping")
        resp = websocket.receive_text()
        assert resp == "pong"

def test_websocket_suscripcion_pedido_no_propietario_rechazado():
    """Verifica que un usuario no dueño del pedido no pueda suscribirse."""
    token = create_access_token({"sub": "2", "email": "user2@test.com", "roles": ["CLIENT"]})
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/ws/pedidos?token={token}&pedido_id=10") as websocket:
            websocket.receive_text()
    assert exc_info.value.code == 1008

def test_websocket_broadcast_al_avanzar_estado():
    """Verifica que se emitan eventos WebSocket a través de las salas al cambiar el estado del pedido."""
    token = create_access_token({"sub": "1", "email": "user1@test.com", "roles": ["CLIENT"]})
    
    with client.websocket_connect(f"/ws/pedidos?token={token}&pedido_id=10") as websocket:
        # Simulamos la actualización de estado del pedido en la FSM
        with Session(engine) as session:
            service = PedidoService(session)
            service.avanzar_estado(
                pedido_id=10,
                usuario_id=3,
                roles=["ADMIN"],
                data=AvanzarEstadoRequest(estado_hacia="CONFIRMADO", motivo="Aprobado por admin")
            )
            
        # Recibir la notificación desde el WebSocket
        event = websocket.receive_json()
        assert event["event"] == "ORDER_STATE_CHANGED"
        assert event["pedido_id"] == 10
        assert event["estado_codigo"] == "CONFIRMADO"
        assert event["usuario_id"] == 1
