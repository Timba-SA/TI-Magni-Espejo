from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario

class DireccionEntrega(SQLModel, table=True):
    """Modelo para representar las direcciones de entrega de los usuarios.
    Soporta múltiples direcciones, marcas de principal, y soft delete.
    """
    __tablename__ = "direcciones_entrega"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", nullable=False)

    alias: Optional[str] = Field(default=None, max_length=50)
    linea1: str = Field(nullable=False)
    linea2: Optional[str] = Field(default=None)
    ciudad: str = Field(max_length=100, nullable=False)
    provincia: Optional[str] = Field(default=None, max_length=100)
    codigo_postal: Optional[str] = Field(default=None, max_length=10)

    es_principal: bool = Field(default=False, nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None)

    # Relación con Usuario
    usuario: Optional["Usuario"] = Relationship(back_populates="direcciones")
