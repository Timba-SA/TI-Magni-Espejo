from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.ingredientes.schemas import (
    IngredienteCreate,
    IngredienteUpdate,
    IngredienteRead,
)
from app.modules.ingredientes.service import IngredienteService

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/", response_model=list[IngredienteRead], status_code=status.HTTP_200_OK)
def listar_ingredientes(
    session: SessionDep,
    solo_alergenos: Annotated[
        bool,
        Query(description="Filtrar solo ingredientes marcados como alérgenos"),
    ] = False,
):
    return IngredienteService(session).listar(solo_alergenos=solo_alergenos)


@router.get("/{id}", response_model=IngredienteRead, status_code=status.HTTP_200_OK)
def obtener_ingrediente(id: int, session: SessionDep):
    return IngredienteService(session).obtener(id)


@router.post("/", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def crear_ingrediente(data: IngredienteCreate, session: SessionDep):
    return IngredienteService(session).crear(data)


@router.patch("/{id}", response_model=IngredienteRead, status_code=status.HTTP_200_OK)
def actualizar_ingrediente(id: int, data: IngredienteUpdate, session: SessionDep):
    return IngredienteService(session).actualizar(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_ingrediente(id: int, session: SessionDep):
    IngredienteService(session).eliminar(id)
