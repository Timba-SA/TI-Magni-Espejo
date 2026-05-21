from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional

class MetricKPICards(BaseModel):
    ingresos_totales: Decimal = Field(..., description="Suma de montos de pedidos entregados o confirmados")
    cantidad_pedidos: int = Field(..., description="Volumen de pedidos confirmados/entregados")
    ticket_promedio: Decimal = Field(..., description="Monto promedio por pedido")
    clientes_activos: int = Field(..., description="Cantidad de usuarios únicos que realizaron al menos un pedido")

class ProductoVendidoResponse(BaseModel):
    producto_id: int
    nombre: str
    cantidad_vendida: int
    ingresos_generados: Decimal

class ClienteMasCompradorResponse(BaseModel):
    usuario_id: int
    nombre_completo: str
    email: str
    cantidad_pedidos: int
    total_gastado: Decimal

class DistribucionPedidosResponse(BaseModel):
    estado_codigo: str
    cantidad: int

class VentaTemporalResponse(BaseModel):
    fecha: str  # Formato YYYY-MM-DD
    ingresos: Decimal
    cantidad_pedidos: int

class DashboardMetricsResponse(BaseModel):
    kpis: MetricKPICards
    productos_mas_vendidos: list[ProductoVendidoResponse]
    clientes_mas_compradores: list[ClienteMasCompradorResponse]
    distribucion_pedidos: list[DistribucionPedidosResponse]
    ventas_por_fecha: list[VentaTemporalResponse]
