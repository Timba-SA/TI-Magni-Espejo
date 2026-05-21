import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from decimal import Decimal
from datetime import datetime, timedelta

from main import app
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido, EstadoPedido, FormaPago
from app.modules.usuarios.models import Usuario

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
    
    # Insertar semillas requeridas (Estados y Formas de pago)
    with Session(engine) as session:
        # Estados
        ep_pend = EstadoPedido(codigo="PENDIENTE", descripcion="Pendiente", orden=1, es_terminal=False)
        ep_entr = EstadoPedido(codigo="ENTREGADO", descripcion="Entregado", orden=5, es_terminal=True)
        ep_canc = EstadoPedido(codigo="CANCELADO", descripcion="Cancelado", orden=6, es_terminal=True)
        session.add_all([ep_pend, ep_entr, ep_canc])
        
        # Formas de pago
        fp_efec = FormaPago(codigo="EFECTIVO", descripcion="Efectivo", habilitado=True)
        session.add(fp_efec)
        
        # Usuarios
        user1 = Usuario(id=10, nombre="Juan", apellido="Perez", email="juan@perez.com", password_hash="hash")
        user2 = Usuario(id=11, nombre="Maria", apellido="Gomez", email="maria@gomez.com", password_hash="hash")
        session.add_all([user1, user2])
        
        # Productos
        prod1 = Producto(id=101, nombre="Muzzarella", descripcion="Pizza clásica", precio_base=Decimal("100.00"), stock_cantidad=10, disponible=True)
        prod2 = Producto(id=102, nombre="Fugazzeta", descripcion="Cebolla y queso", precio_base=Decimal("120.00"), stock_cantidad=8, disponible=True)
        session.add_all([prod1, prod2])
        
        session.commit()
        
        # Pedidos
        now = datetime.utcnow()
        
        # Pedido 1: ENTREGADO, Juan, hace 5 días, total = 350.00 (Prod1 x 2, Prod2 x 1, costo_envio 50)
        p1 = Pedido(
            id=1,
            usuario_id=10,
            estado_codigo="ENTREGADO",
            forma_pago_codigo="EFECTIVO",
            subtotal=Decimal("300.00"),
            descuento=Decimal("0.00"),
            costo_envio=Decimal("50.00"),
            total=Decimal("350.00"),
            created_at=now - timedelta(days=5)
        )
        session.add(p1)
        session.commit()
        
        dp1_1 = DetallePedido(pedido_id=1, producto_id=101, cantidad=2, nombre_snapshot="Muzzarella", precio_snapshot=Decimal("100.00"), subtotal_snap=Decimal("200.00"))
        dp1_2 = DetallePedido(pedido_id=1, producto_id=102, cantidad=1, nombre_snapshot="Fugazzeta", precio_snapshot=Decimal("100.00"), subtotal_snap=Decimal("100.00"))
        session.add_all([dp1_1, dp1_2])
        
        # Pedido 2: ENTREGADO, Maria, hace 15 días, total = 150.00 (Prod1 x 1, costo_envio 50)
        p2 = Pedido(
            id=2,
            usuario_id=11,
            estado_codigo="ENTREGADO",
            forma_pago_codigo="EFECTIVO",
            subtotal=Decimal("100.00"),
            descuento=Decimal("0.00"),
            costo_envio=Decimal("50.00"),
            total=Decimal("150.00"),
            created_at=now - timedelta(days=15)
        )
        session.add(p2)
        session.commit()
        
        dp2_1 = DetallePedido(pedido_id=2, producto_id=101, cantidad=1, nombre_snapshot="Muzzarella", precio_snapshot=Decimal("100.00"), subtotal_snap=Decimal("100.00"))
        session.add(dp2_1)
        
        # Pedido 3: CANCELADO, Juan, hace 2 días (Excluido de ingresos totales y ticket promedio)
        p3 = Pedido(
            id=3,
            usuario_id=10,
            estado_codigo="CANCELADO",
            forma_pago_codigo="EFECTIVO",
            subtotal=Decimal("100.00"),
            descuento=Decimal("0.00"),
            costo_envio=Decimal("50.00"),
            total=Decimal("150.00"),
            created_at=now - timedelta(days=2)
        )
        session.add(p3)
        session.commit()
        
        dp3_1 = DetallePedido(pedido_id=3, producto_id=101, cantidad=1, nombre_snapshot="Muzzarella", precio_snapshot=Decimal("100.00"), subtotal_snap=Decimal("100.00"))
        session.add(dp3_1)
        
        # Pedido 4: ENTREGADO, Juan, hace 40 días (Excluido del rango por defecto de 30 días)
        p4 = Pedido(
            id=4,
            usuario_id=10,
            estado_codigo="ENTREGADO",
            forma_pago_codigo="EFECTIVO",
            subtotal=Decimal("200.00"),
            descuento=Decimal("0.00"),
            costo_envio=Decimal("50.00"),
            total=Decimal("250.00"),
            created_at=now - timedelta(days=40)
        )
        session.add(p4)
        session.commit()
        
        dp4_1 = DetallePedido(pedido_id=4, producto_id=102, cantidad=2, nombre_snapshot="Fugazzeta", precio_snapshot=Decimal("100.00"), subtotal_snap=Decimal("200.00"))
        session.add(dp4_1)
        
        # Pedido 5: Soft-deleted (Eliminado lógicamente, excluido por completo siempre)
        p5 = Pedido(
            id=5,
            usuario_id=11,
            estado_codigo="ENTREGADO",
            forma_pago_codigo="EFECTIVO",
            subtotal=Decimal("100.00"),
            descuento=Decimal("0.00"),
            costo_envio=Decimal("50.00"),
            total=Decimal("150.00"),
            created_at=now - timedelta(days=10),
            deleted_at=now
        )
        session.add(p5)
        session.commit()
        
        dp5_1 = DetallePedido(pedido_id=5, producto_id=101, cantidad=1, nombre_snapshot="Muzzarella", precio_snapshot=Decimal("100.00"), subtotal_snap=Decimal("100.00"))
        session.add(dp5_1)
        
        session.commit()
        
    yield
    SQLModel.metadata.drop_all(engine)
    app.dependency_overrides.clear()


def test_obtener_metricas_dashboard_admin_satisfactorio():
    """
    Escenario 1: El administrador obtiene las métricas con éxito (rango por defecto de 30 días).
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    response = client.get("/api/v1/admin/dashboard/metrics")
    assert response.status_code == 200
    
    data = response.json()
    
    # Validar KPIs
    # Dentro de los últimos 30 días y activos (excluyendo el pedido 4 que es de hace 40 días, y el 5 que está soft-deleted):
    # Pedido 1: ENTREGADO (Total 350.00)
    # Pedido 2: ENTREGADO (Total 150.00)
    # Pedido 3: CANCELADO (Total 150.00) -> Excluido de KPIs financieros de facturación
    #
    # Ingresos totales = 350 + 150 = 500
    # Cantidad pedidos confirmados = 2
    # Ticket promedio = 500 / 2 = 250
    # Clientes activos = 2 (Juan y María)
    kpis = data["kpis"]
    assert float(kpis["ingresos_totales"]) == 500.0
    assert kpis["cantidad_pedidos"] == 2
    assert float(kpis["ticket_promedio"]) == 250.0
    assert kpis["clientes_activos"] == 2

    # Validar Productos más vendidos
    # Muzzarella (101): Pedido 1 (2 unidades) + Pedido 2 (1 unidad) = 3 vendidas (Pedido 3 cancelado y Pedido 5 soft-deleted se excluyen o procesan de acuerdo a reglas)
    # Fugazzeta (102): Pedido 1 (1 unidad) = 1 vendida
    prods = data["productos_mas_vendidos"]
    assert len(prods) > 0
    assert prods[0]["producto_id"] == 101
    assert prods[0]["cantidad_vendida"] == 3
    assert float(prods[0]["ingresos_generados"]) == 300.0  # 3 * 100

    # Validar Clientes más compradores
    # Juan (10): Pedido 1 (350.00)
    # Maria (11): Pedido 2 (150.00)
    clientes = data["clientes_mas_compradores"]
    assert len(clientes) > 0
    assert clientes[0]["usuario_id"] == 10
    assert clientes[0]["cantidad_pedidos"] == 1
    assert float(clientes[0]["total_gastado"]) == 350.0


def test_obtener_metricas_dashboard_forbidden_para_roles_no_autorizados():
    """
    Escenario 2: Operador de stock o cliente común reciben 403 Forbidden.
    """
    global current_test_user
    
    # Caso 1: STOCK
    current_test_user = {"sub": 2, "email": "stock@test.com", "roles": ["STOCK"]}
    response = client.get("/api/v1/admin/dashboard/metrics")
    assert response.status_code == 403
    assert "roles" in response.json()["detail"].lower()

    # Caso 2: CLIENT
    current_test_user = {"sub": 3, "email": "client@test.com", "roles": ["CLIENT"]}
    response = client.get("/api/v1/admin/dashboard/metrics")
    assert response.status_code == 403
    assert "roles" in response.json()["detail"].lower()


def test_obtener_metricas_dashboard_filtrado_temporal():
    """
    Escenario 3: El filtro por rango de fechas funciona correctamente.
    """
    global current_test_user
    current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

    # Filtrar un rango que cubra hasta hace 45 días (incluyendo el pedido 4 que tiene 40 días de antigüedad)
    # Rango: desde hace 45 días hasta hoy
    inicio = (datetime.utcnow() - timedelta(days=45)).strftime("%Y-%m-%d")
    fin = datetime.utcnow().strftime("%Y-%m-%d")
    
    response = client.get(f"/api/v1/admin/dashboard/metrics?fecha_inicio={inicio}&fecha_fin={fin}")
    assert response.status_code == 200
    
    data = response.json()
    kpis = data["kpis"]
    
    # Ahora se incluye el Pedido 4 (Total 250.00, ENTREGADO).
    # Ingresos totales = 350 + 150 + 250 = 750
    # Cantidad pedidos confirmados = 3
    # Ticket promedio = 750 / 3 = 250
    assert float(kpis["ingresos_totales"]) == 750.0
    assert kpis["cantidad_pedidos"] == 3
