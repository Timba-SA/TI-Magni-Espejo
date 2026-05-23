from datetime import datetime
from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.direcciones.models import DireccionEntrega
from app.modules.direcciones.schemas import DireccionCreateRequest, DireccionUpdateRequest
from app.modules.direcciones.unit_of_work import DireccionUoW

class DireccionService:
    def __init__(self, session: Session):
        self._session = session

    def listar(self, usuario_id: int) -> list[DireccionEntrega]:
        """Retorna todas las direcciones activas del usuario."""
        with DireccionUoW(self._session) as uow:
            return uow.direcciones.get_all_active_by_user(usuario_id)

    def crear(self, usuario_id: int, data: DireccionCreateRequest) -> DireccionEntrega:
        """Crea una nueva dirección de entrega para el usuario.
        Si es la primera dirección activa del usuario, se establece automáticamente como principal.
        """
        with DireccionUoW(self._session) as uow:
            direcciones = uow.direcciones.get_all_active_by_user(usuario_id)
            es_principal = len(direcciones) == 0
            
            direccion = DireccionEntrega(
                usuario_id=usuario_id,
                es_principal=es_principal,
                **data.model_dump()
            )
            uow.direcciones.add(direccion)
            
        self._session.refresh(direccion)
        return direccion

    def actualizar(self, direccion_id: int, usuario_id: int, data: DireccionUpdateRequest) -> DireccionEntrega:
        """Actualiza los campos de una dirección existente, validando existencia y pertenencia."""
        with DireccionUoW(self._session) as uow:
            direccion = uow.direcciones.get_by_id(direccion_id)
            if not direccion or direccion.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Dirección con id={direccion_id} no encontrada."
                )
            
            if direccion.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permiso para modificar esta dirección."
                )
            
            cambios = data.model_dump(exclude_unset=True)
            for key, value in cambios.items():
                setattr(direccion, key, value)
                
            direccion.updated_at = datetime.utcnow()
            uow.direcciones.add(direccion)
            
        self._session.refresh(direccion)
        return direccion

    def set_principal(self, direccion_id: int, usuario_id: int) -> DireccionEntrega:
        """Establece una dirección como principal y desmarca de principal las demás del mismo usuario."""
        with DireccionUoW(self._session) as uow:
            direccion = uow.direcciones.get_by_id(direccion_id)
            if not direccion or direccion.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Dirección con id={direccion_id} no encontrada."
                )
            
            if direccion.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permiso para modificar esta dirección."
                )
            
            if not direccion.es_principal:
                uow.direcciones.desmarcar_principales_previas(usuario_id)
                direccion.es_principal = True
                direccion.updated_at = datetime.utcnow()
                uow.direcciones.add(direccion)
                
        self._session.refresh(direccion)
        return direccion

    def eliminar(self, direccion_id: int, usuario_id: int, mock_active_orders: bool = False) -> None:
        """Elimina (soft delete) una dirección si no tiene pedidos en curso."""
        with DireccionUoW(self._session) as uow:
            direccion = uow.direcciones.get_by_id(direccion_id)
            if not direccion or direccion.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Dirección con id={direccion_id} no encontrada."
                )
            
            if direccion.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permiso para eliminar esta dirección."
                )
            
            if mock_active_orders:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="No se puede eliminar la dirección porque tiene pedidos activos en curso."
                )
                
            uow.direcciones.soft_delete(direccion)
