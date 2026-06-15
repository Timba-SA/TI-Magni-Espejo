"""
test_estadisticas.py — Tests del módulo /estadisticas/.

Cubre los criterios de aceptación EST-01 a EST-05 definidos en el spec v6.0:

  EST-01: pedidos CANCELADOS no cuentan en ingresos/métricas.
  EST-02: ingresos de productos se calculan con DetallePedido.subtotal_snap.
  EST-03: /ingresos solo cuenta pagos con mp_status == 'approved'.
  EST-04: los montos en la respuesta son Decimal (verificados como str numérico).
  EST-05: los endpoints aceptan filtros fecha_inicio / fecha_fin.
"""

import pytest
from decimal import Decimal
from datetime import datetime, timedelta

from app.modules.pagos.models import Pago


# ── helpers ───────────────────────────────────────────────────────────────────

def _pago(db_session, pedido_id: int, amount: Decimal, mp_status: str = "approved"):
    """Inserta un registro Pago en la sesión de test."""
    pago = Pago(
        pedido_id=pedido_id,
        mp_status=mp_status,
        mp_status_detail="accredited",
        external_reference=f"ref-{pedido_id}-{mp_status}-{amount}",
        idempotency_key=f"idem-{pedido_id}-{mp_status}-{amount}",
        transaction_amount=amount,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db_session.add(pago)
    db_session.commit()
    return pago


# ══════════════════════════════════════════════════════════════════════════════
# EST-01 — pedidos CANCELADOS excluidos de métricas de ingreso
# ══════════════════════════════════════════════════════════════════════════════

class TestEST01CanceladosExcluidos:
    def test_resumen_excluye_cancelado(self, client, admin_headers, pedido_factory):
        """GET /estadisticas/resumen no suma el total del pedido CANCELADO."""
        pedido_factory(estado_codigo="ENTREGADO", total=Decimal("1000.00"))
        pedido_factory(estado_codigo="CANCELADO", total=Decimal("500.00"))

        resp = client.get("/api/v1/estadisticas/resumen", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()

        assert data["total_pedidos"] == 1, "Solo debe contar el pedido ENTREGADO"
        assert Decimal(data["ingresos_totales"]) == Decimal("1000.00")
        assert data["pedidos_cancelados"] == 1

    def test_ventas_excluye_cancelado(self, client, admin_headers, pedido_factory):
        """GET /estadisticas/ventas no incluye el ingreso del pedido CANCELADO."""
        pedido_factory(estado_codigo="CONFIRMADO", total=Decimal("800.00"))
        pedido_factory(estado_codigo="CANCELADO", total=Decimal("800.00"))

        resp = client.get("/api/v1/estadisticas/ventas", headers=admin_headers)
        assert resp.status_code == 200
        total = sum(Decimal(v["ingresos"]) for v in resp.json()["ventas"])
        assert total == Decimal("800.00"), "Solo debe sumar el pedido CONFIRMADO"

    def test_productos_top_excluye_cancelado(self, client, admin_headers, pedido_factory):
        """GET /estadisticas/productos-top no suma cantidades de pedidos CANCELADOS."""
        pedido_factory(
            estado_codigo="ENTREGADO",
            total=Decimal("500.00"),
            detalles=[{"producto_id": 1, "nombre_snapshot": "Milanesa", "cantidad": 2, "precio": Decimal("250.00")}],
        )
        pedido_factory(
            estado_codigo="CANCELADO",
            total=Decimal("500.00"),
            detalles=[{"producto_id": 1, "nombre_snapshot": "Milanesa", "cantidad": 5, "precio": Decimal("250.00")}],
        )

        resp = client.get("/api/v1/estadisticas/productos-top", headers=admin_headers)
        assert resp.status_code == 200
        productos = resp.json()["productos"]
        milanesa = next((p for p in productos if p["producto_id"] == 1), None)
        assert milanesa is not None
        assert milanesa["cantidad_vendida"] == 2, "Solo debe contar el pedido ENTREGADO"


# ══════════════════════════════════════════════════════════════════════════════
# EST-02 — ingresos de productos calculados con subtotal_snap
# ══════════════════════════════════════════════════════════════════════════════

class TestEST02SubtotalSnap:
    def test_ingresos_producto_usan_subtotal_snap(self, client, admin_headers, pedido_factory):
        """
        Los ingresos_generados deben ser cantidad * precio_snapshot (subtotal_snap),
        no el precio actual del producto (que podría haber cambiado).
        """
        # subtotal_snap = 3 * 400 = 1200
        pedido_factory(
            estado_codigo="ENTREGADO",
            total=Decimal("1200.00"),
            detalles=[{
                "producto_id": 2,
                "nombre_snapshot": "Lomo",
                "cantidad": 3,
                "precio": Decimal("400.00"),
            }],
        )

        resp = client.get("/api/v1/estadisticas/productos-top", headers=admin_headers)
        assert resp.status_code == 200
        productos = resp.json()["productos"]
        lomo = next((p for p in productos if p["producto_id"] == 2), None)
        assert lomo is not None
        assert Decimal(lomo["ingresos_generados"]) == Decimal("1200.00"), \
            "Debe usar subtotal_snap (3 × 400 = 1200)"


# ══════════════════════════════════════════════════════════════════════════════
# EST-03 — /ingresos solo cuenta pagos con mp_status == 'approved'
# ══════════════════════════════════════════════════════════════════════════════

class TestEST03SoloPagosAprobados:
    def test_ingresos_solo_approved(self, client, admin_headers, pedido_factory, db_session):
        """Solo los pagos con mp_status='approved' deben aparecer en el total."""
        p_aprobado = pedido_factory(estado_codigo="ENTREGADO", total=Decimal("1000.00"))
        p_rechazado = pedido_factory(estado_codigo="ENTREGADO", total=Decimal("500.00"))

        _pago(db_session, p_aprobado.id, Decimal("1000.00"), mp_status="approved")
        _pago(db_session, p_rechazado.id, Decimal("500.00"), mp_status="rejected")

        resp = client.get("/api/v1/estadisticas/ingresos", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()

        assert Decimal(data["total_aprobado"]) == Decimal("1000.00"), \
            "Solo debe sumar el pago approved"

    def test_ingresos_pending_excluido(self, client, admin_headers, pedido_factory, db_session):
        """Pagos en estado 'pending' también deben quedar excluidos."""
        p = pedido_factory(estado_codigo="CONFIRMADO", total=Decimal("700.00"))
        _pago(db_session, p.id, Decimal("700.00"), mp_status="pending")

        resp = client.get("/api/v1/estadisticas/ingresos", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert Decimal(data["total_aprobado"]) == Decimal("0.00"), \
            "Un pago pending no debe contarse"


# ══════════════════════════════════════════════════════════════════════════════
# EST-04 — los montos son Decimal (se verifican como strings numéricos en JSON)
# ══════════════════════════════════════════════════════════════════════════════

class TestEST04MontoDecimal:
    def test_resumen_montos_son_decimal(self, client, admin_headers, pedido_factory):
        pedido_factory(estado_codigo="ENTREGADO", total=Decimal("999.99"))

        resp = client.get("/api/v1/estadisticas/resumen", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()

        # Pydantic serializa Decimal como string en JSON; verificamos que sea parseable
        assert Decimal(data["ingresos_totales"]) >= Decimal("0")
        assert Decimal(data["ticket_promedio"]) >= Decimal("0")

    def test_productos_top_montos_son_decimal(self, client, admin_headers, pedido_factory):
        pedido_factory(
            estado_codigo="ENTREGADO",
            total=Decimal("333.33"),
            detalles=[{"producto_id": 3, "nombre_snapshot": "Empanada", "cantidad": 1, "precio": Decimal("333.33")}],
        )

        resp = client.get("/api/v1/estadisticas/productos-top", headers=admin_headers)
        assert resp.status_code == 200
        for prod in resp.json()["productos"]:
            assert Decimal(prod["ingresos_generados"]) >= Decimal("0")


# ══════════════════════════════════════════════════════════════════════════════
# EST-05 — filtros de fecha funcionan correctamente
# ══════════════════════════════════════════════════════════════════════════════

class TestEST05FiltrosFecha:
    def test_resumen_filtra_por_fecha_inicio(self, client, admin_headers, pedido_factory):
        """Pedidos anteriores al rango no deben aparecer en el resumen."""
        ayer = datetime.utcnow() - timedelta(days=1)
        hace_10 = datetime.utcnow() - timedelta(days=10)

        pedido_factory(
            estado_codigo="ENTREGADO",
            total=Decimal("200.00"),
            created_at=hace_10,  # fuera del rango
        )
        pedido_factory(
            estado_codigo="ENTREGADO",
            total=Decimal("300.00"),
            created_at=ayer,  # dentro del rango
        )

        hoy_str = datetime.utcnow().strftime("%Y-%m-%d")
        ayer_str = ayer.strftime("%Y-%m-%d")

        resp = client.get(
            f"/api/v1/estadisticas/resumen?fecha_inicio={ayer_str}&fecha_fin={hoy_str}",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_pedidos"] == 1
        assert Decimal(data["ingresos_totales"]) == Decimal("300.00")

    def test_ventas_filtra_por_fecha_fin(self, client, admin_headers, pedido_factory):
        """Pedidos posteriores al fecha_fin no deben aparecer en ventas."""
        hace_5 = datetime.utcnow() - timedelta(days=5)
        hace_1 = datetime.utcnow() - timedelta(days=1)

        pedido_factory(estado_codigo="ENTREGADO", total=Decimal("100.00"), created_at=hace_5)
        pedido_factory(estado_codigo="ENTREGADO", total=Decimal("500.00"), created_at=hace_1)

        # Rango: últimos 3 días — solo debe incluir el pedido de hace 1 día
        hace_3_str = (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d")
        hoy_str = datetime.utcnow().strftime("%Y-%m-%d")

        resp = client.get(
            f"/api/v1/estadisticas/ventas?fecha_inicio={hace_3_str}&fecha_fin={hoy_str}",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        total = sum(Decimal(v["ingresos"]) for v in resp.json()["ventas"])
        assert total == Decimal("500.00")

    def test_ingresos_filtra_por_fecha(self, client, admin_headers, pedido_factory, db_session):
        """Los pagos approved fuera del rango no deben contarse."""
        hace_15 = datetime.utcnow() - timedelta(days=15)
        hace_2 = datetime.utcnow() - timedelta(days=2)

        p_viejo = pedido_factory(estado_codigo="ENTREGADO", total=Decimal("900.00"), created_at=hace_15)
        p_reciente = pedido_factory(estado_codigo="ENTREGADO", total=Decimal("400.00"), created_at=hace_2)

        pago_viejo = _pago(db_session, p_viejo.id, Decimal("900.00"), "approved")
        pago_viejo.created_at = hace_15
        db_session.add(pago_viejo)

        pago_reciente = _pago(db_session, p_reciente.id, Decimal("400.00"), "approved")
        pago_reciente.created_at = hace_2
        db_session.add(pago_reciente)
        db_session.commit()

        hace_5_str = (datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%d")
        hoy_str = datetime.utcnow().strftime("%Y-%m-%d")

        resp = client.get(
            f"/api/v1/estadisticas/ingresos?fecha_inicio={hace_5_str}&fecha_fin={hoy_str}",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert Decimal(data["total_aprobado"]) == Decimal("400.00"), \
            "Solo debe contarse el pago reciente dentro del rango"


# ══════════════════════════════════════════════════════════════════════════════
# Tests de seguridad — solo ADMIN puede acceder
# ══════════════════════════════════════════════════════════════════════════════

class TestAcceso:
    @pytest.mark.parametrize("endpoint", [
        "/api/v1/estadisticas/resumen",
        "/api/v1/estadisticas/ventas",
        "/api/v1/estadisticas/productos-top",
        "/api/v1/estadisticas/pedidos-por-estado",
        "/api/v1/estadisticas/ingresos",
    ])
    def test_sin_autenticacion_retorna_401(self, client, endpoint):
        resp = client.get(endpoint)
        assert resp.status_code == 401

    @pytest.mark.parametrize("endpoint", [
        "/api/v1/estadisticas/resumen",
        "/api/v1/estadisticas/ventas",
        "/api/v1/estadisticas/productos-top",
        "/api/v1/estadisticas/pedidos-por-estado",
        "/api/v1/estadisticas/ingresos",
    ])
    def test_cliente_retorna_403(self, client, client_headers, endpoint):
        resp = client.get(endpoint, headers=client_headers)
        assert resp.status_code == 403

    def test_admin_puede_acceder_resumen(self, client, admin_headers):
        resp = client.get("/api/v1/estadisticas/resumen", headers=admin_headers)
        assert resp.status_code == 200
