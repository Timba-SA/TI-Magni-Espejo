from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.service import CategoriaService

router = APIRouter(prefix="/categorias", tags=["Categorías"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/", response_model=list[CategoriaRead], status_code=status.HTTP_200_OK)
def listar_categorias(session: SessionDep):
    return CategoriaService(session).listar()


@router.get("/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def obtener_categoria(id: int, session: SessionDep):
    return CategoriaService(session).obtener(id)


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, session: SessionDep):
    return CategoriaService(session).crear(data)


@router.patch("/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def actualizar_categoria(id: int, data: CategoriaUpdate, session: SessionDep):
    return CategoriaService(session).actualizar(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(id: int, session: SessionDep):
    CategoriaService(session).eliminar(id)
