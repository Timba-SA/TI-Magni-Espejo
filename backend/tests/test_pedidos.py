import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from datetime import datetime
from decimal import Decimal

from main import app as fastapi_app
from app.core.database import get_session
from app.core.dependencies import get_current_user

# Importar todos los modelos necesarios para que se registren en la metadata
import app.modules.auth.models
import app.modules.usuarios.models
import app.modules.direcciones.models
import app.modules.productos.models
import app.modules.pedidos.models

from app.modules.usuarios.models import Usuario
from app.modules.direcciones.models import DireccionEntrega
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido, HistorialEstadoPedido, EstadoPedido, FormaPago

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
    # Registrar overrides de forma aislada
    fastapi_app.dependency_overrides[get_session] = override_get_session
    fastapi_app.dependency_overrides[get_current_user] = override_get_current_user
    
    SQLModel.metadata.create_all(engine)
    
    # Insertar data semilla en la base de datos de prueba
    with Session(engine) as session:
        # 1. Usuarios
        u1 = Usuario(id=1, nombre="Cliente", apellido="Uno", email="user1@test.com", password_hash="pw")
        u2 = Usuario(id=2, nombre="Admin", apellido="General", email="admin@test.com", password_hash="pw")
        session.add(u1)
        session.add(u2)
        
        # 2. Dirección activa para usuario 1
        d1 = DireccionEntrega(id=1, usuario_id=1, alias="Casa", linea1="Calle 123", ciudad="CABA", es_principal=True)
        session.add(d1)
        
        # 3. Productos con stock conocido
        p1 = Producto(id=1, nombre="Hamburguesa", precio_base=Decimal("150.00"), stock_cantidad=10, is_active=True)
        p2 = Producto(id=2, nombre="Papas Fritas", precio_base=Decimal("80.00"), stock_cantidad=2, is_active=True)
        session.add(p1)
        session.add(p2)
        
        # 4. Estados de pedido semilla
        estados = [
            EstadoPedido(codigo="PENDIENTE", descripcion="Pendiente de confirmación", orden=1, es_terminal=False),
            EstadoPedido(codigo="CONFIRMADO", descripcion="Confirmado", orden=2, es_terminal=False),
            EstadoPedido(codigo="EN_PREP", descripcion="En preparación", orden=3, es_terminal=False),
            EstadoPedido(codigo="EN_CAMINO", descripcion="En camino de entrega", orden=4, es_terminal=False),
            EstadoPedido(codigo="ENTREGADO", descripcion="Entregado satisfactoriamente", orden=5, es_terminal=True),
            EstadoPedido(codigo="CANCELADO", descripcion="Cancelado", orden=6, es_terminal=True),
        ]
        for est in estados:
            session.add(est)
            
        # 5. Formas de pago semilla
        formas = [
            FormaPago(codigo="EFECTIVO", descripcion="Pago en Efectivo", habilitado=True),
            FormaPago(codigo="MERCADOPAGO", descripcion="Mercado Pago", habilitado=True),
            FormaPago(codigo="TARJETA", descripcion="Tarjeta Deshabilitada", habilitado=False),
        ]
        for f in formas:
            session.add(f)
            
        session.commit()
        
    yield
    SQLModel.metadata.drop_all(engine)
    fastapi_app.dependency_overrides.clear()


def test_crear_pedido_satisfactorio():
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    payload = {
        "direccion_id": 1,
        "forma_pago_codigo": "MERCADOPAGO",
        "notas": "Tocar timbre 3B",
        "items": [
            {"producto_id": 1, "cantidad": 2, "personalizacion": [1, 2]}
        ]
    }
    
    response = client.post("/api/v1/pedidos/", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    data = response.json()
    
    # 1. Validar campos calculados
    assert data["estado_codigo"] == "PENDIENTE"
    assert Decimal(str(data["subtotal"])) == Decimal("300.00")  # 150 * 2
    assert Decimal(str(data["costo_envio"])) == Decimal("50.00")
    assert Decimal(str(data["total"])) == Decimal("350.00")
    assert data["usuario_id"] == 1
    
    # 2. Validar reducción de stock en la DB
    with Session(engine) as session:
        db_prod = session.get(Producto, 1)
        assert db_prod.stock_cantidad == 8  # 10 - 2
        
        # 3. Validar snapshots y detalles
        db_pedido = session.get(Pedido, data["id"])
        assert len(db_pedido.detalles) == 1
        det = db_pedido.detalles[0]
        assert det.nombre_snapshot == "Hamburguesa"
        assert det.precio_snapshot == Decimal("150.00")
        assert det.personalizacion == [1, 2]
        
        # 4. Validar transición de estado inicial en el historial
        assert len(db_pedido.historial) == 1
        hist = db_pedido.historial[0]
        assert hist.estado_desde is None
        assert hist.estado_hacia == "PENDIENTE"
        assert hist.usuario_id == 1


def test_crear_pedido_stock_insuficiente():
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    payload = {
        "direccion_id": 1,
        "forma_pago_codigo": "EFECTIVO",
        "items": [
            {"producto_id": 2, "cantidad": 5}  # Stock es 2, intentamos comprar 5
        ]
    }
    
    response = client.post("/api/v1/pedidos/", json=payload)
    assert response.status_code == 400
    assert "stock" in response.json()["detail"].lower()
    
    # Validar que no se creó ningún pedido y el stock sigue intacto
    with Session(engine) as session:
        db_prod = session.get(Producto, 2)
        assert db_prod.stock_cantidad == 2
        pedidos_db = session.exec(app.modules.pedidos.repository.select(Pedido)).all()
        assert len(pedidos_db) == 0


def test_obtener_formas_pago_habilitadas():
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}
    
    response = client.get("/api/v1/pedidos/formas-pago")
    assert response.status_code == 200
    data = response.json()
    
    # Debe listar EFECTIVO y MERCADOPAGO, pero no TARJETA (habilitado=False)
    codigos = [item["codigo"] for item in data]
    assert "EFECTIVO" in codigos
    assert "MERCADOPAGO" in codigos
    assert "TARJETA" not in codigos


def test_avanzar_estado_satisfactorio_admin():
    global current_test_user
    
    # Insertar pedido inicial en PENDIENTE
    with Session(engine) as session:
        p = Pedido(id=1, usuario_id=1, direccion_id=1, estado_codigo="PENDIENTE", forma_pago_codigo="EFECTIVO")
        session.add(p)
        session.commit()
        
    # Transicionar como ADMIN
    current_test_user = {"sub": 2, "email": "admin@test.com", "roles": ["ADMIN"]}
    
    payload = {"estado_hacia": "CONFIRMADO"}
    response = client.patch("/api/v1/pedidos/1/estado", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estado_codigo"] == "CONFIRMADO"
    
    # Validar historial
    with Session(engine) as session:
        db_pedido = session.get(Pedido, 1)
        assert db_pedido.estado_codigo == "CONFIRMADO"
        # Debe tener 1 historial (el insertado manualmente no tenía, ahora tiene el de cambio)
        assert len(db_pedido.historial) == 1
        hist = db_pedido.historial[0]
        assert hist.estado_desde == "PENDIENTE"
        assert hist.estado_hacia == "CONFIRMADO"
        assert hist.usuario_id == 2


def test_avanzar_estado_invalido_fsm():
    global current_test_user
    
    with Session(engine) as session:
        p = Pedido(id=1, usuario_id=1, direccion_id=1, estado_codigo="PENDIENTE", forma_pago_codigo="EFECTIVO")
        session.add(p)
        session.commit()
        
    current_test_user = {"sub": 2, "email": "admin@test.com", "roles": ["ADMIN"]}
    
    # PENDIENTE a EN_CAMINO es inválido (debe pasar por CONFIRMADO -> EN_PREP primero)
    payload = {"estado_hacia": "EN_CAMINO"}
    response = client.patch("/api/v1/pedidos/1/estado", json=payload)
    assert response.status_code == 400
    assert "transición" in response.json()["detail"].lower()


def test_cancelar_pedido_cliente_devolucion_stock():
    global current_test_user
    
    # Insertar pedido confirmado con un detalle (y reducir stock inicialmente para simular compra)
    with Session(engine) as session:
        p = Pedido(id=1, usuario_id=1, direccion_id=1, estado_codigo="CONFIRMADO", forma_pago_codigo="EFECTIVO")
        det = DetallePedido(pedido_id=1, producto_id=1, cantidad=2, nombre_snapshot="H", precio_snapshot=150, subtotal_snap=300)
        session.add(p)
        session.add(det)
        
        # Simulamos que el stock ya fue reducido al crearlo
        prod = session.get(Producto, 1)
        prod.stock_cantidad = 8
        session.add(prod)
        session.commit()
        
    # Cancelar como cliente dueño del pedido
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}
    
    payload = {"estado_hacia": "CANCELADO", "motivo": "Demasiada demora"}
    response = client.patch("/api/v1/pedidos/1/estado", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estado_codigo"] == "CANCELADO"
    
    # Validar que el stock del producto 1 volvió a 10 (se devolvieron los 2 del detalle)
    with Session(engine) as session:
        db_prod = session.get(Producto, 1)
        assert db_prod.stock_cantidad == 10
        db_pedido = session.get(Pedido, 1)
        assert len(db_pedido.historial) == 1
        hist = db_pedido.historial[0]
        assert hist.estado_desde == "CONFIRMADO"
        assert hist.estado_hacia == "CANCELADO"
        assert hist.motivo == "Demasiada demora"


def test_cancelar_pedido_en_preparacion_cliente_forbidden():
    global current_test_user
    
    # Insertar pedido en preparación
    with Session(engine) as session:
        p = Pedido(id=1, usuario_id=1, direccion_id=1, estado_codigo="EN_PREP", forma_pago_codigo="EFECTIVO")
        session.add(p)
        session.commit()
        
    # Intentar cancelar como CLIENT (está en cocina, ya no puede)
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}
    
    payload = {"estado_hacia": "CANCELADO", "motivo": "Me arrepentí"}
    response = client.patch("/api/v1/pedidos/1/estado", json=payload)
    assert response.status_code == 403
    assert "preparación" in response.json()["detail"].lower()
    
    # Verificar que sigue en preparación
    with Session(engine) as session:
        db_pedido = session.get(Pedido, 1)
        assert db_pedido.estado_codigo == "EN_PREP"


def test_cancelar_sin_motivo_bad_request():
    global current_test_user
    
    with Session(engine) as session:
        p = Pedido(id=1, usuario_id=1, direccion_id=1, estado_codigo="PENDIENTE", forma_pago_codigo="EFECTIVO")
        session.add(p)
        session.commit()
        
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}
    
    # Intentar cancelar sin proveer el motivo obligatorio
    payload = {"estado_hacia": "CANCELADO"}
    response = client.patch("/api/v1/pedidos/1/estado", json=payload)
    assert response.status_code == 400
    assert "motivo" in response.json()["detail"].lower()


def test_avanzar_estado_sistema_usuario_null():
    """
    Test de Nulidad de Historial:
    Comprueba que cuando el sistema (usuario_id=None) avanza el estado,
    no se lanzan errores de permisos y en el historial se almacena usuario_id = None.
    Esto es crucial para que no fallen los webhooks asíncronos de MercadoPago.
    """
    from app.modules.pedidos.service import PedidoService
    from app.modules.pedidos.schemas import AvanzarEstadoRequest

    # 1. Insertar un pedido inicial en estado PENDIENTE usando la base de datos directa
    with Session(engine) as session:
        pedido = Pedido(
            id=99,
            usuario_id=1,
            direccion_id=1,
            estado_codigo="PENDIENTE",
            forma_pago_codigo="MERCADOPAGO",
            subtotal=Decimal("150.00"),
            total=Decimal("200.00")
        )
        session.add(pedido)
        session.commit()

    # 2. Transicionar como SISTEMA (usuario_id=None) a través del servicio
    with Session(engine) as session:
        service = PedidoService(session)
        req = AvanzarEstadoRequest(estado_hacia="CONFIRMADO")
        
        # Llamamos al servicio con usuario_id=None
        pedido_actualizado = service.avanzar_estado(
            pedido_id=99,
            usuario_id=None,
            roles=[],
            data=req
        )
        assert pedido_actualizado.estado_codigo == "CONFIRMADO"
        
        # Validar en el historial que el registro tenga usuario_id en NULL
        historial_sistema = [h for h in pedido_actualizado.historial if h.estado_hacia == "CONFIRMADO"]
        assert len(historial_sistema) == 1
        assert historial_sistema[0].usuario_id is None
        assert historial_sistema[0].estado_desde == "PENDIENTE"


def test_detalle_pedido_restriccion_unica_compuesta():
    """
    Test de Restricción Única Compuesta:
    Verifica que la restricción UNIQUE(pedido_id, producto_id) impida
    que existan registros duplicados del mismo producto en un pedido.
    """
    from sqlalchemy.exc import IntegrityError

    # 1. Crear un pedido y agregar dos detalles idénticos (mismo pedido_id y producto_id)
    with Session(engine) as session:
        pedido = Pedido(
            id=100,
            usuario_id=1,
            direccion_id=1,
            estado_codigo="PENDIENTE",
            forma_pago_codigo="EFECTIVO"
        )
        session.add(pedido)
        session.commit()

    # 2. Agregar primer detalle
    with Session(engine) as session:
        det1 = DetallePedido(
            pedido_id=100,
            producto_id=1,
            cantidad=1,
            nombre_snapshot="Hamburguesa",
            precio_snapshot=Decimal("150.00"),
            subtotal_snap=Decimal("150.00")
        )
        session.add(det1)
        session.commit()

    # 3. Intentar agregar el segundo detalle idéntico y esperar que falle por integridad de base de datos
    with Session(engine) as session:
        det2 = DetallePedido(
            pedido_id=100,
            producto_id=1,
            cantidad=2,
            nombre_snapshot="Hamburguesa",
            precio_snapshot=Decimal("150.00"),
            subtotal_snap=Decimal("300.00")
        )
        session.add(det2)
        
        with pytest.raises(IntegrityError):
            session.commit()


def test_detalle_pedido_personalizacion_json():
    """
    Test de Personalización Estructurada:
    Valida que el campo 'personalizacion' se almacene y recupere
    correctamente como una lista de enteros en la base de datos.
    """
    from sqlmodel import select

    # 1. Crear un pedido y un detalle con personalización estructurada [1, 4, 7]
    with Session(engine) as session:
        pedido = Pedido(
            id=101,
            usuario_id=1,
            direccion_id=1,
            estado_codigo="PENDIENTE",
            forma_pago_codigo="EFECTIVO"
        )
        session.add(pedido)
        
        det = DetallePedido(
            pedido_id=101,
            producto_id=1,
            cantidad=1,
            nombre_snapshot="Hamburguesa",
            precio_snapshot=Decimal("150.00"),
            subtotal_snap=Decimal("150.00"),
            personalizacion=[1, 4, 7]  # Lista de IDs de ingredientes
        )
        session.add(det)
        session.commit()

    # 2. Recuperar en una nueva sesión y comprobar que se serializa y deserializa como tipo lista nativo
    with Session(engine) as session:
        db_det = session.exec(
            select(DetallePedido).where(DetallePedido.pedido_id == 101, DetallePedido.producto_id == 1)
        ).one()
        assert isinstance(db_det.personalizacion, list)
        assert db_det.personalizacion == [1, 4, 7]


def test_aislamiento_pedidos_personales_admin():
    """
    Verifica que GET /api/v1/pedidos/ retorne ÚNICAMENTE los pedidos del propio usuario logueado,
    incluso si el usuario tiene rol de ADMIN.
    """
    global current_test_user

    # 1. Crear un pedido para Cliente (usuario 1) y un pedido para Admin (usuario 2)
    with Session(engine) as session:
        p_cliente = Pedido(id=201, usuario_id=1, direccion_id=1, estado_codigo="PENDIENTE", forma_pago_codigo="EFECTIVO")
        p_admin = Pedido(id=202, usuario_id=2, direccion_id=None, estado_codigo="CONFIRMADO", forma_pago_codigo="MERCADOPAGO")
        session.add(p_cliente)
        session.add(p_admin)
        session.commit()

    # 2. Consultar como ADMIN (usuario 2)
    current_test_user = {"sub": 2, "email": "admin@test.com", "roles": ["ADMIN"]}
    response = client.get("/api/v1/pedidos/")
    assert response.status_code == 200
    data = response.json()

    # 3. Validar que el ADMIN solo reciba SU pedido (id 202) y no el del Cliente (id 201)
    pedidos_ids = [p["id"] for p in data]
    assert 202 in pedidos_ids
    assert 201 not in pedidos_ids
    assert len(pedidos_ids) == 1


def test_pedidos_gestion_solo_admin_y_encargado():
    """
    Verifica que GET /api/v1/pedidos/gestion retorne todos los pedidos del local
    únicamente si el usuario es ADMIN o ENCARGADO, y lance 403 Forbidden para CLIENT.
    """
    global current_test_user

    # 1. Crear pedidos
    with Session(engine) as session:
        p_cliente = Pedido(id=301, usuario_id=1, direccion_id=1, estado_codigo="PENDIENTE", forma_pago_codigo="EFECTIVO")
        p_admin = Pedido(id=302, usuario_id=2, direccion_id=None, estado_codigo="CONFIRMADO", forma_pago_codigo="MERCADOPAGO")
        session.add(p_cliente)
        session.add(p_admin)
        session.commit()

    # 2. Consultar como CLIENT (debe dar 403 Forbidden)
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}
    response = client.get("/api/v1/pedidos/gestion")
    assert response.status_code == 403

    # 3. Consultar como ADMIN (debe dar 200 y retornar ambos pedidos)
    current_test_user = {"sub": 2, "email": "admin@test.com", "roles": ["ADMIN"]}
    response = client.get("/api/v1/pedidos/gestion")
    assert response.status_code == 200
    data = response.json()
    
    pedidos_ids = [p["id"] for p in data]
    assert 301 in pedidos_ids
    assert 302 in pedidos_ids


def test_crear_pedido_personalizacion_list_int():
    """
    Verifica que se pueda crear un pedido enviando una lista de enteros en la personalización de ítems
    y que se guarde y retorne correctamente sin errores de validación de FastAPI o Pydantic.
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "user1@test.com", "roles": ["CLIENT"]}

    payload = {
        "direccion_id": 1,
        "forma_pago_codigo": "MERCADOPAGO",
        "notas": "Hamburguesa sin cebolla ni pepinos",
        "items": [
            {"producto_id": 1, "cantidad": 1, "personalizacion": [2, 3]}  # Insumos excluidos
        ]
    }
    
    response = client.post("/api/v1/pedidos/", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    data = response.json()
    
    # Validar que los datos de personalización se retornen como una lista de enteros
    assert len(data["detalles"]) == 1
    det = data["detalles"][0]
    assert det["personalizacion"] == [2, 3]


