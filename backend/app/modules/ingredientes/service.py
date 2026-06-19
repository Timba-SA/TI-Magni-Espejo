import io
from datetime import datetime, timezone
from typing import Optional

import openpyxl
from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.ingredientes.models import Ingrediente
from app.modules.ingredientes.schemas import (
    IngredienteCreate,
    IngredienteListResponse,
    IngredienteRead,
    IngredienteUpdate,
)
from app.modules.ingredientes.unit_of_work import IngredienteUoW


class IngredienteService:

    def __init__(self, session: Session):
        self._session = session

    # ── Helpers privados ───────────────────────────────────────────────────────

    def _get_or_404(self, uow: IngredienteUoW, id: int) -> Ingrediente:
        """Obtiene un ingrediente no archivado o lanza 404."""
        obj = uow.ingredientes.get_activo_by_id(id)
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingrediente con id={id} no encontrado.",
            )
        return obj

    # ── Métodos públicos ───────────────────────────────────────────────────────

    def listar(
        self,
        nombre: Optional[str] = None,
        es_alergeno: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
        incluir_inactivos: bool = False,
    ) -> IngredienteListResponse:
        with IngredienteUoW(self._session) as uow:
            items, total = uow.ingredientes.list_with_filters(
                nombre, es_alergeno, skip, limit, incluir_inactivos
            )
            return IngredienteListResponse(
                items=[IngredienteRead.model_validate(i) for i in items],
                total=total,
                skip=skip,
                limit=limit,
            )

    def obtener(self, id: int) -> Ingrediente:
        with IngredienteUoW(self._session) as uow:
            return self._get_or_404(uow, id)

    def crear(self, data: IngredienteCreate) -> Ingrediente:
        with IngredienteUoW(self._session) as uow:
            existing = uow.ingredientes.get_activo_by_nombre(data.nombre)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Ya existe un ingrediente con el nombre '{data.nombre}'.",
                )
            obj = Ingrediente(**data.model_dump())
            # add() hace flush() + refresh(). El commit lo hace __exit__ del UoW.
            return uow.ingredientes.add(obj)

    def actualizar(self, id: int, data: IngredienteUpdate) -> Ingrediente:
        with IngredienteUoW(self._session) as uow:
            obj = self._get_or_404(uow, id)
            update_data = data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(obj, field, value)
            obj.updated_at = datetime.now(timezone.utc)
            updated_obj = uow.ingredientes.update(obj)

            # Recalcular productos que usan este ingrediente en su receta
            from app.modules.productos.service import recalcular_producto_stock_y_precio

            recetas = uow.producto_ingredientes.get_by_ingrediente(id)
            for r in recetas:
                recalcular_producto_stock_y_precio(self._session, r.producto_id)

            return updated_obj

    def toggle_active(self, id: int) -> Ingrediente:
        """
        Invierte el estado is_active del ingrediente.
        - is_active=True  → el ingrediente está habilitado (deleted_at = None).
        - is_active=False → inhabilitado (deleted_at = ahora, sigue visible en admin con etiqueta "Inactivo").
        """
        with IngredienteUoW(self._session) as uow:
            obj = self._get_or_404(uow, id)
            obj.is_active = not obj.is_active
            if not obj.is_active:
                obj.deleted_at = datetime.now(timezone.utc)
            else:
                obj.deleted_at = None
            obj.updated_at = datetime.now(timezone.utc)
            return uow.ingredientes.update(obj)

    def eliminar(self, id: int) -> None:
        """Soft delete: archiva el ingrediente (deleted_at). No se puede deshacer desde la UI normal."""
        with IngredienteUoW(self._session) as uow:
            obj = self._get_or_404(uow, id)
            obj.is_active = False
            # soft_delete() hace flush(). El commit lo hace __exit__ del UoW.
            uow.ingredientes.soft_delete(obj)

    def exportar(
        self,
        nombre: Optional[str] = None,
        es_alergeno: Optional[bool] = None,
    ) -> bytes:
        with IngredienteUoW(self._session) as uow:
            items, _ = uow.ingredientes.list_with_filters(
                nombre, es_alergeno, skip=0, limit=10_000, incluir_inactivos=True
            )

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Ingredientes"

        headers = [
            "ID",
            "Nombre",
            "Descripción",
            "Alérgeno",
            "Estado",
            "Peso",
            "Fecha de Desactivación",
            "Creado",
        ]
        ws.append(headers)

        for item in items:
            ws.append([
                item.id,
                item.nombre,
                item.descripcion or "",
                "Sí" if item.es_alergeno else "No",
                "Activo" if item.is_active else "Inactivo",
                float(item.peso) if item.peso is not None else "",
                item.deleted_at.strftime("%Y-%m-%d %H:%M") if item.deleted_at else "",
                item.created_at.strftime("%Y-%m-%d %H:%M"),
            ])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.read()
