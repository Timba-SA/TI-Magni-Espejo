from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import (
    UnidadMedidaRepository,
    ProductoRepository,
    ProductoCategoriaRepository,
    ProductoIngredienteRepository,
)
from app.modules.categorias.repository import CategoriaRepository
from app.modules.ingredientes.repository import IngredienteRepository


class ProductoUoW(UnitOfWork):
    def __init__(self, session: Session):
        super().__init__(session)
        self.unidades_medida = UnidadMedidaRepository(session)
        self.productos = ProductoRepository(session)
        self.categorias = CategoriaRepository(session)
        self.ingredientes = IngredienteRepository(session)
        self.producto_categorias = ProductoCategoriaRepository(session)
        self.producto_ingredientes = ProductoIngredienteRepository(session)