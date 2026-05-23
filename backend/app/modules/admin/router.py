from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional

from app.core.database import get_session
from app.core.dependencies import require_role
from app.modules.admin.schemas import DashboardMetricsResponse
from app.modules.admin.service import AdminService

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get(
    "/dashboard/metrics",
    response_model=DashboardMetricsResponse,
    dependencies=[Depends(require_role("ADMIN"))]
)
def get_dashboard_metrics(
    fecha_inicio: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    session: Session = Depends(get_session)
) -> DashboardMetricsResponse:
    """
    Obtener métricas agregadas financieras, comerciales y de clientes para el panel administrador.
    Requiere rol: ADMIN.
    """
    return AdminService.obtener_metricas_dashboard(
        session=session,
        fecha_inicio_str=fecha_inicio,
        fecha_fin_str=fecha_fin
    )
