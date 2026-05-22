from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Column, Numeric
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.productos.models import ProductoIngrediente, UnidadMedida


class Ingrediente(SQLModel, table=True):
    __tablename__ = "ingredientes"

    id: Optional[int] = Field(default=None, primary_key=True)

    nombre: str = Field(max_length=100, unique=True, nullable=False)
    descripcion: Optional[str] = Field(default=None)
    es_alergeno: bool = Field(default=False, nullable=False)
    is_active: bool = Field(default=True, nullable=False)  # False = Inhabilitado (visible en admin)

    unidad_medida_id: Optional[int] = Field(
        default=None,
        foreign_key="unidades_medida.id",
        nullable=True,
    )
    stock_actual: Decimal = Field(
        default=Decimal("0.000"),
        sa_column=Column(
            Numeric(precision=10, scale=3),
            nullable=False,
            server_default="0.000",
        ),
    )
    stock_minimo: Decimal = Field(
        default=Decimal("0.000"),
        sa_column=Column(
            Numeric(precision=10, scale=3),
            nullable=False,
            server_default="0.000",
        ),
    )
    costo_unitario: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=Column(
            Numeric(precision=10, scale=2),
            nullable=False,
            server_default="0.00",
        ),
    )
    peso: Optional[Decimal] = Field(
        default=None,
        sa_column=Column(
            Numeric(precision=10, scale=3),
            nullable=True,
            server_default=None,
        ),
    )

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None)

    # Relación a UnidadMedida (unidad de stock)
    unidad_medida: Optional["UnidadMedida"] = Relationship()

    # Relación N:N con Producto a través de ProductoIngrediente
    producto_ingredientes: list["ProductoIngrediente"] = Relationship(
        back_populates="ingrediente"
    )
