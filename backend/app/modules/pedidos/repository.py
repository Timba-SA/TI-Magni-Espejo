from typing import Optional
from sqlmodel import Session, select

from app.core.repository import BaseRepository
from app.modules.pedidos.models import Pedido, DetallePedido, HistorialEstadoPedido, EstadoPedido, FormaPago


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(Pedido, session)

    def get_all_by_usuario(self, usuario_id: int) -> list[Pedido]:
        """Filtra los pedidos activos (no eliminados lógicamente) de un usuario específico."""
        return self.session.exec(
            select(Pedido).where(
                Pedido.usuario_id == usuario_id,
                Pedido.deleted_at == None  # noqa: E711
            ).order_by(Pedido.created_at.desc())
        ).all()

    def get_all_active(self) -> list[Pedido]:
        """Retorna todos los pedidos activos (para vistas de administración/pedidos)."""
        return self.session.exec(
            select(Pedido).where(
                Pedido.deleted_at == None  # noqa: E711
            ).order_by(Pedido.created_at.desc())
        ).all()


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(DetallePedido, session)

    def get_by_pedido(self, pedido_id: int) -> list[DetallePedido]:
        """Retorna los detalles asociados a un pedido específico."""
        return self.session.exec(
            select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
        ).all()


class HistorialEstadoPedidoRepository(BaseRepository[HistorialEstadoPedido]):
    def __init__(self, session: Session):
        super().__init__(HistorialEstadoPedido, session)

    def get_by_pedido(self, pedido_id: int) -> list[HistorialEstadoPedido]:
        """Retorna el historial de estados de un pedido ordenado de forma cronológica."""
        return self.session.exec(
            select(HistorialEstadoPedido).where(
                HistorialEstadoPedido.pedido_id == pedido_id
            ).order_by(HistorialEstadoPedido.created_at.asc())
        ).all()

    def add_entrada(self, entrada: HistorialEstadoPedido) -> HistorialEstadoPedido:
        """Inserta un nuevo registro en el historial de estados.
        Solo inserta (add), nunca actualiza."""
        self.session.add(entrada)
        self.session.flush()
        self.session.refresh(entrada)
        return entrada


class EstadoPedidoRepository(BaseRepository[EstadoPedido]):
    def __init__(self, session: Session):
        super().__init__(EstadoPedido, session)

    def get_by_codigo(self, codigo: str) -> Optional[EstadoPedido]:
        """Obtiene un estado de pedido por su código único."""
        return self.session.get(EstadoPedido, codigo)


class FormaPagoRepository(BaseRepository[FormaPago]):
    def __init__(self, session: Session):
        super().__init__(FormaPago, session)

    def get_habilitados(self) -> list[FormaPago]:
        """Retorna solo las formas de pago que están habilitadas para el cliente."""
        return self.session.exec(
            select(FormaPago).where(FormaPago.habilitado == True)  # noqa: E711
        ).all()
