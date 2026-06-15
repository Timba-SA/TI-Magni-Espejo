"""
Router de estadísticas — 5 endpoints requeridos por el spec v6.0.

Todos requieren rol ADMIN.
Todos soportan filtros opcionales fecha_inicio / fecha_fin (YYYY-MM-DD).
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.dependencies import require_role
from app.modules.estadisticas import service
from app.modules.estadisticas.schemas import (
    ResumenResponse,
    VentasResponse,
    ProductosTopResponse,
    PedidosPorEstadoResponse,
    IngresosResponse,
)

router = APIRouter(
    prefix="/estadisticas",
    tags=["Estadísticas"],
    dependencies=[Depends(require_role("ADMIN"))],
)

_FECHA_Q = {
    "fecha_inicio": Query(None, description="Fecha inicio del rango (YYYY-MM-DD)"),
    "fecha_fin": Query(None, description="Fecha fin del rango (YYYY-MM-DD)"),
}


@router.get("/resumen", response_model=ResumenResponse)
def resumen(
    fecha_inicio: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    session: Session = Depends(get_session),
) -> ResumenResponse:
    """
    KPIs generales: total de pedidos, ingresos, ticket promedio y clientes únicos.
    Excluye pedidos CANCELADOS (EST-01).
    """
    return service.get_resumen(session, fecha_inicio, fecha_fin)


@router.get("/ventas", response_model=VentasResponse)
def ventas(
    fecha_inicio: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    session: Session = Depends(get_session),
) -> VentasResponse:
    """
    Evolución diaria de ventas (ingresos + cantidad de pedidos) en el rango indicado.
    Excluye pedidos CANCELADOS (EST-01). Soporta filtros de fecha (EST-05).
    """
    return service.get_ventas(session, fecha_inicio, fecha_fin)


@router.get("/productos-top", response_model=ProductosTopResponse)
def productos_top(
    fecha_inicio: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    limit: int = Query(10, ge=1, le=50, description="Cantidad máxima de productos"),
    session: Session = Depends(get_session),
) -> ProductosTopResponse:
    """
    Ranking de los N productos más vendidos por cantidad.
    Ingresos calculados con DetallePedido.subtotal_snap (EST-02).
    Excluye pedidos CANCELADOS (EST-01).
    """
    return service.get_productos_top(session, fecha_inicio, fecha_fin, limit)


@router.get("/pedidos-por-estado", response_model=PedidosPorEstadoResponse)
def pedidos_por_estado(
    fecha_inicio: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    session: Session = Depends(get_session),
) -> PedidosPorEstadoResponse:
    """
    Distribución de pedidos por estado (incluye CANCELADO para visibilidad operativa).
    Devuelve cantidad y porcentaje por estado.
    """
    return service.get_pedidos_por_estado(session, fecha_inicio, fecha_fin)


@router.get("/ingresos", response_model=IngresosResponse)
def ingresos(
    fecha_inicio: Optional[str] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[str] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    session: Session = Depends(get_session),
) -> IngresosResponse:
    """
    Ingresos agrupados por mes, considerando únicamente pagos con mp_status == 'approved' (EST-03).
    Montos en Decimal (EST-04).
    """
    return service.get_ingresos(session, fecha_inicio, fecha_fin)
