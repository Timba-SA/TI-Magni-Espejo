from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.database import SessionLocal
from app.core.dependencies import require_role
from app.shared.unit_of_work import UnitOfWork
from app.shared.exceptions import AppException
from app.modules.categorias.schemas import CategoriaCreate, CategoriaResponse
from app.modules.categorias.service import CategoriaService

router = APIRouter(prefix="/api/categorias", tags=["Categorias"])

STAFF_ROLES = ("Admin", "Encargado")

def get_uow():
    return UnitOfWork(SessionLocal)

def get_categoria_service(uow: UnitOfWork = Depends(get_uow)):
    return CategoriaService(uow)

@router.get("", response_model=List[CategoriaResponse])
def list_categorias(service: CategoriaService = Depends(get_categoria_service)):
    """Lectura pública — no requiere autenticación."""
    try:
        return service.get_all()
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.post("", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_role(*STAFF_ROLES))])
def create_categoria(data: CategoriaCreate, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.create(data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.delete("/{id}", response_model=CategoriaResponse,
               dependencies=[Depends(require_role(*STAFF_ROLES))])
def delete_categoria(id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.delete(id)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
