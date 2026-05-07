from fastapi import APIRouter, Depends, Query, status, HTTPException
from typing import List, Optional
from app.core.database import SessionLocal
from app.core.dependencies import require_role
from app.shared.unit_of_work import UnitOfWork
from app.shared.exceptions import AppException
from app.modules.insumos.schemas import InsumoCreate, InsumoUpdate, InsumoResponse, InsumosStatsResponse
from app.modules.insumos.service import InsumoService

router = APIRouter(prefix="/api/insumos", tags=["Insumos"])

STAFF_ROLES = ("Admin", "Encargado")

def get_uow():
    return UnitOfWork(SessionLocal)

def get_insumo_service(uow: UnitOfWork = Depends(get_uow)):
    return InsumoService(uow)

# ── Lectura (cualquier usuario autenticado) ───────────────────────────────────

@router.get("/stats/resumen", response_model=InsumosStatsResponse)
def get_stats(service: InsumoService = Depends(get_insumo_service)):
    try:
        return service.get_stats()
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get("", response_model=List[InsumoResponse])
def list_insumos(
    search: Optional[str] = None,
    categoria: Optional[str] = None,
    estado: Optional[str] = None,
    stockBajo: Optional[bool] = None,
    service: InsumoService = Depends(get_insumo_service)
):
    try:
        return service.get_all(search, categoria, estado, stockBajo)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get("/{id}", response_model=InsumoResponse)
def get_insumo(id: int, service: InsumoService = Depends(get_insumo_service)):
    try:
        return service.get_by_id(id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

# ── Escritura (Admin o Encargado) ─────────────────────────────────────────────

@router.post("", response_model=InsumoResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*STAFF_ROLES))])
def create_insumo(data: InsumoCreate, service: InsumoService = Depends(get_insumo_service)):
    try:
        return service.create(data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.put("/{id}", response_model=InsumoResponse,
            dependencies=[Depends(require_role(*STAFF_ROLES))])
def update_insumo_full(id: int, data: InsumoUpdate, service: InsumoService = Depends(get_insumo_service)):
    try:
        return service.update(id, data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.patch("/{id}", response_model=InsumoResponse,
              dependencies=[Depends(require_role(*STAFF_ROLES))])
def update_insumo_partial(id: int, data: InsumoUpdate, service: InsumoService = Depends(get_insumo_service)):
    try:
        return service.update(id, data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.delete("/{id}", response_model=InsumoResponse,
               description="Realiza baja lógica del insumo.",
               dependencies=[Depends(require_role(*STAFF_ROLES))])
def delete_insumo(id: int, service: InsumoService = Depends(get_insumo_service)):
    try:
        return service.logical_delete(id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.patch("/{id}/reactivar", response_model=InsumoResponse,
              dependencies=[Depends(require_role(*STAFF_ROLES))])
def reactivate_insumo(id: int, service: InsumoService = Depends(get_insumo_service)):
    try:
        return service.reactivate(id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
