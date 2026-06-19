from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel, Field

from app.modules.categorias.schemas import CategoriaRead



# ─── UnidadMedida ─────────────────────────────────────────────────────────────

from app.modules.productos.schemas_medida import (
    UnidadMedidaCreate,
    UnidadMedidaUpdate,
    UnidadMedidaRead,
)


# ─── ProductoCategoria ────────────────────────────────────────────────────────

class ProductoCategoriaCreate(SQLModel):
    categoria_id: int
    es_principal: bool = False


class ProductoCategoriaRead(SQLModel):
    categoria_id: int
    es_principal: bool
    categoria: Optional[CategoriaRead] = None


# ─── ProductoIngrediente ──────────────────────────────────────────────────────

class ProductoIngredienteCreate(SQLModel):
    ingrediente_id: int
    cantidad: Decimal = Decimal("1.000")
    unidad_medida_id: Optional[int] = None
    es_removible: bool = False


class ProductoIngredienteRead(SQLModel):
    ingrediente_id: int
    cantidad: Decimal
    unidad_medida_id: Optional[int] = None
    unidad_medida: Optional[UnidadMedidaRead] = None
    es_removible: bool
    ingrediente: Optional["IngredienteRead"] = None


# ─── Producto ─────────────────────────────────────────────────────────────────

class ProductoCreate(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_base: Decimal
    margen_ganancia: Decimal = Decimal("0.00")
    imagenes_url: list[str] = []
    stock_cantidad: int = 0
    disponible: bool = True
    unidad_venta_id: Optional[int] = None
    categorias: list[ProductoCategoriaCreate] = []
    ingredientes: list[ProductoIngredienteCreate] = []


class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_base: Optional[Decimal] = None
    margen_ganancia: Optional[Decimal] = None
    imagenes_url: Optional[list[str]] = None
    stock_cantidad: Optional[int] = None
    disponible: Optional[bool] = None
    unidad_venta_id: Optional[int] = None
    categorias: Optional[list[ProductoCategoriaCreate]] = None
    ingredientes: Optional[list[ProductoIngredienteCreate]] = None



class ProductoDisponibilidadUpdate(SQLModel):
    stock_cantidad: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = Field(default=None)


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio_base: Decimal
    margen_ganancia: Decimal
    imagenes_url: list[str]
    stock_cantidad: int
    disponible: bool
    unidad_venta_id: Optional[int] = None
    unidad_venta: Optional[UnidadMedidaRead] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


from typing import Any
from pydantic import model_validator

class ProductoReadDetalle(ProductoRead):
    """Incluye categorías e ingredientes anidados."""
    categorias: list[ProductoCategoriaRead] = []
    ingredientes: list[ProductoIngredienteRead] = []

    @model_validator(mode="before")
    @classmethod
    def map_relaciones(cls, values: Any) -> Any:
        """
        Mapea los atributos ORM producto_categorias → categorias
        y producto_ingredientes → ingredientes antes de validar.
        Funciona tanto con objetos SQLModel como con dicts.
        """
        if isinstance(values, dict):
            if "categorias" not in values or not values["categorias"]:
                values["categorias"] = values.get("producto_categorias") or []
            if "ingredientes" not in values or not values["ingredientes"]:
                values["ingredientes"] = values.get("producto_ingredientes") or []
            return values

        # Objeto ORM
        if not getattr(values, "categorias", None):
            try:
                object.__setattr__(
                    values, "categorias", list(values.producto_categorias or [])
                )
            except AttributeError:
                pass
        if not getattr(values, "ingredientes", None):
            try:
                object.__setattr__(
                    values, "ingredientes", list(values.producto_ingredientes or [])
                )
            except AttributeError:
                pass
        return values


from app.modules.ingredientes.schemas import IngredienteRead
ProductoIngredienteRead.model_rebuild()
ProductoReadDetalle.model_rebuild()
