from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.ingredientes.models import Ingrediente
from app.modules.ingredientes.schemas import IngredienteCreate, IngredienteUpdate
from app.modules.ingredientes.unit_of_work import IngredienteUoW


class IngredienteService:
    def __init__(self, session: Session):
        self._session = session

    # ── Helper privado ────────────────────────────────────────────────────────

    def _validar_nombre_unico(self, uow: IngredienteUoW, nombre: str) -> None:
        """Lanza 409 si ya existe un ingrediente con ese nombre."""
        if uow.ingredientes.get_by_nombre(nombre):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un ingrediente con el nombre '{nombre}'.",
            )

    # ── Métodos públicos ──────────────────────────────────────────────────────

    def listar(self, solo_alergenos: bool = False) -> list[Ingrediente]:
        with IngredienteUoW(self._session) as uow:
            if solo_alergenos:
                return uow.ingredientes.get_alergenos()
            return uow.ingredientes.get_all_activos()

    def obtener(self, id: int) -> Ingrediente:
        with IngredienteUoW(self._session) as uow:
            ingrediente = uow.ingredientes.get_by_id(id)
            if not ingrediente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id={id} no encontrado.",
                )
            return ingrediente

    def crear(self, data: IngredienteCreate) -> Ingrediente:
        with IngredienteUoW(self._session) as uow:
            self._validar_nombre_unico(uow, data.nombre)

            ingrediente = Ingrediente(**data.model_dump())
            uow.ingredientes.add(ingrediente)

        self._session.refresh(ingrediente)
        return ingrediente

    def actualizar(self, id: int, data: IngredienteUpdate) -> Ingrediente:
        with IngredienteUoW(self._session) as uow:
            ingrediente = uow.ingredientes.get_by_id(id)
            if not ingrediente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id={id} no encontrado.",
                )

            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios and cambios["nombre"] != ingrediente.nombre:
                self._validar_nombre_unico(uow, cambios["nombre"])

            for key, value in cambios.items():
                setattr(ingrediente, key, value)
            ingrediente.updated_at = datetime.utcnow()
            uow.ingredientes.add(ingrediente)

        self._session.refresh(ingrediente)
        return ingrediente

    def eliminar(self, id: int) -> None:
        with IngredienteUoW(self._session) as uow:
            ingrediente = uow.ingredientes.get_by_id(id)
            if not ingrediente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id={id} no encontrado.",
                )
            uow.ingredientes.delete(ingrediente)
