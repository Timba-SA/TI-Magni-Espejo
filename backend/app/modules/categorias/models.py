from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.productos.models import ProductoCategoria


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)

    parent_id: Optional[int] = Field(
        default=None,
        foreign_key="categorias.id",
        nullable=True,
    )
    nombre: str = Field(max_length=100, unique=True, nullable=False)
    descripcion: Optional[str] = Field(default=None)
    imagen_url: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None)

    # Self-referencing: subcategorías
    subcategorias: list["Categoria"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={"foreign_keys": "[Categoria.parent_id]"},
    )
    parent: Optional["Categoria"] = Relationship(
        back_populates="subcategorias",
        sa_relationship_kwargs={
            "foreign_keys": "[Categoria.parent_id]",
            "remote_side": "[Categoria.id]",
        },
    )

    # Relación N:N con Producto a través de ProductoCategoria
    producto_categorias: list["ProductoCategoria"] = Relationship(
        back_populates="categoria"
    )
