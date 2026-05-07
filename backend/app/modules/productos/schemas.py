from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel

from app.modules.categorias.schemas import CategoriaRead
from app.modules.ingredientes.schemas import IngredienteRead


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
    es_removible: bool = False


class ProductoIngredienteRead(SQLModel):
    ingrediente_id: int
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
    categorias: list[ProductoCategoriaCreate] = []
    ingredientes: list[ProductoIngredienteCreate] = []


class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_base: Optional[Decimal] = None
    imagenes_url: Optional[list[str]] = None
    stock_cantidad: Optional[int] = None
    disponible: Optional[bool] = None


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio_base: Decimal
    imagenes_url: list[str]
    stock_cantidad: int
    disponible: bool
    created_at: datetime
    updated_at: datetime


class ProductoReadDetalle(ProductoRead):
    """Incluye categorías e ingredientes anidados."""
    categorias: list[ProductoCategoriaRead] = []
    ingredientes: list[ProductoIngredienteRead] = []
