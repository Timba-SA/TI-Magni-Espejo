from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUoW


class CategoriaService:
    def __init__(self, session: Session):
        self._session = session

    # ── Helper privado ────────────────────────────────────────────────────────

    def _validar_nombre_unico(self, uow: CategoriaUoW, nombre: str) -> None:
        """Lanza 409 si ya existe una categoría con ese nombre."""
        if uow.categorias.get_by_nombre(nombre):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una categoría con el nombre '{nombre}'.",
            )

    # ── Métodos públicos ──────────────────────────────────────────────────────

    def listar(self) -> list[Categoria]:
        with CategoriaUoW(self._session) as uow:
            return uow.categorias.get_all_activas()

    def obtener(self, id: int) -> Categoria:
        with CategoriaUoW(self._session) as uow:
            categoria = uow.categorias.get_by_id(id)
            if not categoria or categoria.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con id={id} no encontrada.",
                )
            return categoria

    def crear(self, data: CategoriaCreate) -> Categoria:
        with CategoriaUoW(self._session) as uow:
            self._validar_nombre_unico(uow, data.nombre)

            if data.parent_id is not None:
                padre = uow.categorias.get_by_id(data.parent_id)
                if not padre or padre.deleted_at is not None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Categoría padre con id={data.parent_id} no encontrada.",
                    )

            categoria = Categoria(**data.model_dump())
            uow.categorias.add(categoria)

        self._session.refresh(categoria)
        return categoria

    def actualizar(self, id: int, data: CategoriaUpdate) -> Categoria:
        with CategoriaUoW(self._session) as uow:
            categoria = uow.categorias.get_by_id(id)
            if not categoria or categoria.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con id={id} no encontrada.",
                )

            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios and cambios["nombre"] != categoria.nombre:
                self._validar_nombre_unico(uow, cambios["nombre"])

            for key, value in cambios.items():
                setattr(categoria, key, value)
            categoria.updated_at = datetime.utcnow()
            uow.categorias.add(categoria)

        self._session.refresh(categoria)
        return categoria

    def eliminar(self, id: int) -> None:
        with CategoriaUoW(self._session) as uow:
            categoria = uow.categorias.get_by_id(id)
            if not categoria or categoria.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con id={id} no encontrada.",
                )
            categoria.deleted_at = datetime.utcnow()
            uow.categorias.add(categoria)
