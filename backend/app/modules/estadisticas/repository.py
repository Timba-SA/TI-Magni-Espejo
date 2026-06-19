from datetime import datetime

from sqlmodel import Session, select, func

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pagos.models import Pago


class EstadisticasRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_pedidos_en_rango(self, fecha_inicio: datetime, fecha_fin: datetime) -> list[Pedido]:
        """Retorna todos los pedidos activos dentro del rango de fechas."""
        stmt = select(Pedido).where(
            Pedido.created_at >= fecha_inicio,
            Pedido.created_at <= fecha_fin,
            Pedido.deleted_at.is_(None),  # type: ignore[attr-defined]
        )
        return list(self.session.exec(stmt).all())

    def get_productos_top(
        self, fecha_inicio: datetime, fecha_fin: datetime, limit: int = 10
    ) -> list:
        """Retorna los productos más vendidos en el rango (EST-01: excluye CANCELADOS, EST-02: usa subtotal_snap)."""
        stmt = (
            select(
                DetallePedido.producto_id,
                DetallePedido.nombre_snapshot,
                func.sum(DetallePedido.cantidad).label("cantidad_vendida"),
                func.sum(DetallePedido.subtotal_snap).label("ingresos_generados"),
            )
            .join(Pedido, DetallePedido.pedido_id == Pedido.id)
            .where(
                Pedido.created_at >= fecha_inicio,
                Pedido.created_at <= fecha_fin,
                Pedido.deleted_at.is_(None),  # type: ignore[attr-defined]
                Pedido.estado_codigo != "CANCELADO",
            )
            .group_by(DetallePedido.producto_id, DetallePedido.nombre_snapshot)
            .order_by(func.sum(DetallePedido.cantidad).desc())
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())

    def get_pagos_aprobados_en_rango(self, fecha_inicio: datetime, fecha_fin: datetime) -> list[Pago]:
        """Retorna pagos con mp_status == 'approved' dentro del rango (EST-03)."""
        stmt = select(Pago).where(
            Pago.created_at >= fecha_inicio,
            Pago.created_at <= fecha_fin,
            Pago.mp_status == "approved",
        )
        return list(self.session.exec(stmt).all())
