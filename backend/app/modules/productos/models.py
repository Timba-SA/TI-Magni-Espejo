from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import ARRAY, TEXT
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.ingredientes.models import Ingrediente


class ProductoCategoria(SQLModel, table=True):
    """Tabla de unión N:N entre Producto y Categoria (PK compuesta)."""

    __tablename__ = "producto_categorias"

    producto_id: int = Field(
        foreign_key="productos.id",
        primary_key=True,
    )
    categoria_id: int = Field(
        foreign_key="categorias.id",
        primary_key=True,
    )
    es_principal: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    producto: Optional["Producto"] = Relationship(back_populates="producto_categorias")
    categoria: Optional["Categoria"] = Relationship(
        back_populates="producto_categorias"
    )


class ProductoIngrediente(SQLModel, table=True):
    """Tabla de unión N:N entre Producto e Ingrediente (PK compuesta)."""

    __tablename__ = "producto_ingredientes"

    producto_id: int = Field(
        foreign_key="productos.id",
        primary_key=True,
    )
    ingrediente_id: int = Field(
        foreign_key="ingredientes.id",
        primary_key=True,
    )
    es_removible: bool = Field(default=False, nullable=False)

    # Relationships
    producto: Optional["Producto"] = Relationship(back_populates="producto_ingredientes")
    ingrediente: Optional["Ingrediente"] = Relationship(
        back_populates="producto_ingredientes"
    )


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)

    nombre: str = Field(max_length=150, nullable=False)
    descripcion: Optional[str] = Field(default=None)
    precio_base: Decimal = Field(
        decimal_places=2,
        max_digits=10,
        nullable=False,
        ge=0,
    )
    # TEXT[] en PostgreSQL → lista de URLs de imágenes
    imagenes_url: list[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(TEXT), nullable=False, server_default="{}"),
    )
    stock_cantidad: int = Field(default=0, nullable=False, ge=0)
    disponible: bool = Field(default=True, nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None)

    # Relación N:N con Categoria
    producto_categorias: list["ProductoCategoria"] = Relationship(
        back_populates="producto"
    )
    # Relación N:N con Ingrediente
    producto_ingredientes: list["ProductoIngrediente"] = Relationship(
        back_populates="producto"
    )
