from datetime import datetime

from sqlmodel import Session, select, func

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.usuarios.models import Usuario


class AdminRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_pedidos_en_rango(self, fecha_inicio: datetime, fecha_fin: datetime) -> list[Pedido]:
        """Retorna todos los pedidos activos dentro del rango de fechas."""
        stmt = select(Pedido).where(
            Pedido.created_at >= fecha_inicio,
            Pedido.created_at <= fecha_fin,
            Pedido.deleted_at == None  # noqa: E711
        )
        return list(self.session.exec(stmt).all())

    def get_productos_mas_vendidos(
        self, fecha_inicio: datetime, fecha_fin: datetime, limit: int = 5
    ) -> list:
        """Retorna los productos más vendidos en el rango, excluyendo pedidos CANCELADOS."""
        stmt = (
            select(
                DetallePedido.producto_id,
                DetallePedido.nombre_snapshot,
                func.sum(DetallePedido.cantidad).label("cantidad_vendida"),
                func.sum(DetallePedido.subtotal_snap).label("ingresos_generados")
            )
            .join(Pedido, DetallePedido.pedido_id == Pedido.id)
            .where(
                Pedido.created_at >= fecha_inicio,
                Pedido.created_at <= fecha_fin,
                Pedido.deleted_at == None,  # noqa: E711
                Pedido.estado_codigo != "CANCELADO"
            )
            .group_by(DetallePedido.producto_id, DetallePedido.nombre_snapshot)
            .order_by(func.sum(DetallePedido.cantidad).desc())
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())

    def get_clientes_mas_compradores(
        self, fecha_inicio: datetime, fecha_fin: datetime, limit: int = 5
    ) -> list:
        """Retorna los clientes con mayor gasto en el rango, excluyendo pedidos CANCELADOS."""
        stmt = (
            select(
                Pedido.usuario_id,
                Usuario.nombre,
                Usuario.apellido,
                Usuario.email,
                func.count(Pedido.id).label("cantidad_pedidos"),
                func.sum(Pedido.total).label("total_gastado")
            )
            .join(Usuario, Pedido.usuario_id == Usuario.id)
            .where(
                Pedido.created_at >= fecha_inicio,
                Pedido.created_at <= fecha_fin,
                Pedido.deleted_at == None,  # noqa: E711
                Pedido.estado_codigo != "CANCELADO"
            )
            .group_by(Pedido.usuario_id, Usuario.nombre, Usuario.apellido, Usuario.email)
            .order_by(func.sum(Pedido.total).desc())
            .limit(limit)
        )
        return list(self.session.exec(stmt).all())
