from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Column, JSON
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.ingredientes.models import Ingrediente


class UnidadMedida(SQLModel, table=True):
    """Catálogo de unidades de medida físicas (masa, volumen, unidad, área).
    Seed obligatorio: kg, g, L, mL, u, doc, m².
    """

    __tablename__ = "unidades_medida"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=50, nullable=False, unique=True)
    simbolo: str = Field(max_length=10, nullable=False, unique=True)
    # tipo: masa | volumen | unidad | area
    tipo: str = Field(max_length=20, nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


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
    """Tabla de unión N:N entre Producto e Ingrediente (PK compuesta).
    Define la porción de cada ingrediente en la receta del producto.
    """

    __tablename__ = "producto_ingredientes"

    producto_id: int = Field(
        foreign_key="productos.id",
        primary_key=True,
    )
    ingrediente_id: int = Field(
        foreign_key="ingredientes.id",
        primary_key=True,
    )
    # Porción de receta: cantidad y unidad física (ej: 150 g de queso)
    cantidad: Decimal = Field(
        decimal_places=3,
        max_digits=10,
        nullable=False,
        default=Decimal("1.000"),
        gt=0,
    )
    unidad_medida_id: Optional[int] = Field(
        default=None,
        foreign_key="unidades_medida.id",
        nullable=True,
    )
    es_removible: bool = Field(default=False, nullable=False)

    # Relationships
    producto: Optional["Producto"] = Relationship(back_populates="producto_ingredientes")
    ingrediente: Optional["Ingrediente"] = Relationship(
        back_populates="producto_ingredientes"
    )
    unidad_medida: Optional[UnidadMedida] = Relationship()


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)

    # FK opcional a UnidadMedida (aclara la unidad de venta del precio_base)
    # Ej: precio_base=12.50 + unidad_venta="kg" → "S/. 12.50 / kg"
    # Ej: precio_base=3.00 + unidad_venta=None  → "S/. 3.00" (por pieza)
    unidad_venta_id: Optional[int] = Field(
        default=None,
        foreign_key="unidades_medida.id",
        nullable=True,
    )

    nombre: str = Field(max_length=150, nullable=False)
    descripcion: Optional[str] = Field(default=None)
    precio_base: Decimal = Field(
        decimal_places=2,
        max_digits=10,
        nullable=False,
        ge=0,
    )
    # Almacenado como JSON (compatible SQLite y PostgreSQL)
    imagenes_url: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    stock_cantidad: int = Field(default=0, nullable=False, ge=0)
    disponible: bool = Field(default=True, nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None)

    # Relación a UnidadMedida (unidad de venta)
    unidad_venta: Optional[UnidadMedida] = Relationship()

    # Relación N:N con Categoria
    producto_categorias: list["ProductoCategoria"] = Relationship(
        back_populates="producto"
    )
    # Relación N:N con Ingrediente
    producto_ingredientes: list["ProductoIngrediente"] = Relationship(
        back_populates="producto"
    )
