from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, Column, Numeric

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.direcciones.models import DireccionEntrega
    from app.modules.productos.models import Producto

class EstadoPedido(SQLModel, table=True):
    __tablename__ = "estados_pedido"
    
    codigo: str = Field(primary_key=True, max_length=20)
    descripcion: str = Field(max_length=80, nullable=False)
    orden: int = Field(nullable=False)
    es_terminal: bool = Field(nullable=False)

class FormaPago(SQLModel, table=True):
    __tablename__ = "formas_pago"
    
    codigo: str = Field(primary_key=True, max_length=20)
    descripcion: str = Field(max_length=80, nullable=False)
    habilitado: bool = Field(default=True, nullable=False)


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", nullable=False)
    direccion_id: Optional[int] = Field(foreign_key="direcciones_entrega.id", nullable=True)
    estado_codigo: str = Field(foreign_key="estados_pedido.codigo", default="PENDIENTE", nullable=False)
    forma_pago_codigo: str = Field(foreign_key="formas_pago.codigo", nullable=False)
    
    subtotal: Decimal = Field(default=Decimal("0.00"), sa_column=Column(Numeric(precision=10, scale=2), nullable=False))
    descuento: Decimal = Field(default=Decimal("0.00"), sa_column=Column(Numeric(precision=10, scale=2), nullable=False))
    costo_envio: Decimal = Field(default=Decimal("50.00"), sa_column=Column(Numeric(precision=10, scale=2), nullable=False))
    total: Decimal = Field(default=Decimal("0.00"), sa_column=Column(Numeric(precision=10, scale=2), nullable=False))
    
    notas: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None)

    # Relaciones
    usuario: Optional["Usuario"] = Relationship()
    direccion: Optional["DireccionEntrega"] = Relationship()
    detalles: list["DetallePedido"] = Relationship(back_populates="pedido")
    historial: list["HistorialEstadoPedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False)
    producto_id: int = Field(foreign_key="productos.id", nullable=False)
    cantidad: int = Field(nullable=False)
    
    nombre_snapshot: str = Field(max_length=150, nullable=False)
    precio_snapshot: Decimal = Field(sa_column=Column(Numeric(precision=10, scale=2), nullable=False))
    subtotal_snap: Decimal = Field(sa_column=Column(Numeric(precision=10, scale=2), nullable=False))
    personalizacion: Optional[str] = Field(default=None)

    # Relaciones
    pedido: Optional["Pedido"] = Relationship(back_populates="detalles")
    producto: Optional["Producto"] = Relationship()


class HistorialEstadoPedido(SQLModel, table=True):
    __tablename__ = "historial_estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False)
    
    estado_desde: Optional[str] = Field(foreign_key="estados_pedido.codigo", nullable=True)
    estado_hacia: str = Field(foreign_key="estados_pedido.codigo", nullable=False)
    usuario_id: int = Field(foreign_key="usuarios.id", nullable=False)
    
    motivo: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relaciones
    pedido: Optional["Pedido"] = Relationship(back_populates="historial")
