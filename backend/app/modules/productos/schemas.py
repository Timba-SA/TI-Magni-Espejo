from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel

from app.modules.categorias.schemas import CategoriaRead
from app.modules.ingredientes.schemas import IngredienteRead


# ─── UnidadMedida ─────────────────────────────────────────────────────────────

class UnidadMedidaCreate(SQLModel):
    nombre: str
    simbolo: str
    tipo: str  # masa | volumen | unidad | area


class UnidadMedidaUpdate(SQLModel):
    nombre: Optional[str] = None
    simbolo: Optional[str] = None
    tipo: Optional[str] = None


class UnidadMedidaRead(SQLModel):
    id: int
    nombre: str
    simbolo: str
    tipo: str
    created_at: datetime


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
    ingrediente: Optional[IngredienteRead] = None


# ─── Producto ─────────────────────────────────────────────────────────────────

class ProductoCreate(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_base: Decimal
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
    imagenes_url: Optional[list[str]] = None
    stock_cantidad: Optional[int] = None
    disponible: Optional[bool] = None
    unidad_venta_id: Optional[int] = None


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio_base: Decimal
    imagenes_url: list[str]
    stock_cantidad: int
    disponible: bool
    unidad_venta_id: Optional[int] = None
    unidad_venta: Optional[UnidadMedidaRead] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class ProductoReadDetalle(ProductoRead):
    """Incluye categorías e ingredientes anidados."""
    categorias: list[ProductoCategoriaRead] = []
    ingredientes: list[ProductoIngredienteRead] = []
