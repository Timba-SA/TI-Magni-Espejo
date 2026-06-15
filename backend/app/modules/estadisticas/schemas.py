"""
Schemas de respuesta para el módulo de estadísticas.
Todos los montos son Decimal para cumplir EST-04.
"""

from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class ResumenResponse(BaseModel):
    """EST-01: excluye CANCELADO. EST-04: Decimal."""
    total_pedidos: int
    ingresos_totales: Decimal
    ticket_promedio: Decimal
    clientes_unicos: int
    pedidos_cancelados: int


class VentaDiariaResponse(BaseModel):
    """Punto de datos para el gráfico de evolución temporal."""
    fecha: str          # YYYY-MM-DD
    ingresos: Decimal
    cantidad_pedidos: int


class VentasResponse(BaseModel):
    """EST-05: acepta filtros de fecha."""
    fecha_inicio: str
    fecha_fin: str
    ventas: list[VentaDiariaResponse]


class ProductoTopResponse(BaseModel):
    """EST-02: ingresos calculados con subtotal_snap."""
    producto_id: int
    nombre: str
    cantidad_vendida: int
    ingresos_generados: Decimal


class ProductosTopResponse(BaseModel):
    productos: list[ProductoTopResponse]


class EstadoDistribucionResponse(BaseModel):
    """Distribución de pedidos por estado (incluye CANCELADO para visibilidad operativa)."""
    estado_codigo: str
    cantidad: int
    porcentaje: Decimal


class PedidosPorEstadoResponse(BaseModel):
    total: int
    distribucion: list[EstadoDistribucionResponse]


class IngresosMesResponse(BaseModel):
    mes: str            # YYYY-MM
    ingresos: Decimal
    cantidad_pedidos: int


class IngresosResponse(BaseModel):
    """EST-03: solo pagos con mp_status == 'approved'."""
    ingresos_por_mes: list[IngresosMesResponse]
    total_aprobado: Decimal
