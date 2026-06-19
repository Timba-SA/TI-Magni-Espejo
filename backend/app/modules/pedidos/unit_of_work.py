from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import (
    PedidoRepository,
    DetallePedidoRepository,
    HistorialEstadoPedidoRepository,
    EstadoPedidoRepository,
    FormaPagoRepository,
)
from app.modules.productos.repository import ProductoRepository, ProductoIngredienteRepository
from app.modules.ingredientes.repository import IngredienteRepository
from app.modules.direcciones.repository import DireccionRepository


class PedidoUoW(UnitOfWork):
    def __init__(self, session: Session):
        super().__init__(session)
        self.pedidos = PedidoRepository(session)
        self.detalles = DetallePedidoRepository(session)
        self.historial = HistorialEstadoPedidoRepository(session)
        self.estados = EstadoPedidoRepository(session)
        self.formas_pago = FormaPagoRepository(session)
        self.productos = ProductoRepository(session)
        self.ingredientes = IngredienteRepository(session)
        self.producto_ingredientes = ProductoIngredienteRepository(session)
        self.direcciones = DireccionRepository(session)
