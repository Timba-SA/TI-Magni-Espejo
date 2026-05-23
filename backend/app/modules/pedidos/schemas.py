from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlmodel import SQLModel


# --- Requests ---

class ItemPedidoRequest(SQLModel):
    producto_id: int
    cantidad: int
    personalizacion: Optional[list[int]] = None


class CrearPedidoRequest(SQLModel):
    items: list[ItemPedidoRequest]
    direccion_id: Optional[int] = None
    forma_pago_codigo: str
    notas: Optional[str] = None


class AvanzarEstadoRequest(SQLModel):
    estado_hacia: str
    motivo: Optional[str] = None


# --- Responses ---

class EstadoPedidoResponse(SQLModel):
    codigo: str
    descripcion: str
    orden: int
    es_terminal: bool


class FormaPagoResponse(SQLModel):
    codigo: str
    descripcion: str
    habilitado: bool


class DetallePedidoResponse(SQLModel):
    id: Optional[int] = None
    producto_id: int
    cantidad: int
    nombre_snapshot: str
    precio_snapshot: Decimal
    subtotal_snap: Decimal
    personalizacion: Optional[list[int]] = None


class HistorialEstadoResponse(SQLModel):
    id: Optional[int] = None
    estado_desde: Optional[str] = None
    estado_hacia: str
    usuario_id: int
    motivo: Optional[str] = None
    created_at: datetime


class PedidoResponse(SQLModel):
    id: int
    usuario_id: int
    direccion_id: Optional[int] = None
    estado_codigo: str
    forma_pago_codigo: str
    subtotal: Decimal
    descuento: Decimal
    costo_envio: Decimal
    total: Decimal
    notas: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    detalles: list[DetallePedidoResponse] = []


class PedidoDetailResponse(PedidoResponse):
    historial: list[HistorialEstadoResponse] = []
