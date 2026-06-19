from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import (
    UsuarioDetailResponse,
    UsuarioResponse,
    UsuarioRoleUpdateRequest,
    UsuarioUpdateRequest,
    UsuarioCreateRequest,
)

from app.modules.usuarios.unit_of_work import UsuarioUoW


class UsuarioService:
    def __init__(self, session: Session):
        self._session = session

    # ── Helpers privados ───────────────────────────────────────────────────────

    def _get_roles(self, usuario_id: int) -> list[str]:
        """Carga los roles del usuario a través del repositorio."""
        from app.modules.usuarios.repository import UsuarioRepository
        return UsuarioRepository(self._session).get_roles(usuario_id)

    def _get_or_404(self, uow: UsuarioUoW, usuario_id: int) -> Usuario:
        """Obtiene un usuario activo o lanza 404."""
        usuario = uow.usuarios.get_by_id(usuario_id)
        if not usuario or usuario.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Usuario con id={usuario_id} no encontrado.",
            )
        return usuario

    # ── Métodos públicos ───────────────────────────────────────────────────────

    def get_me(self, usuario_id: int) -> UsuarioDetailResponse:
        """Devuelve el perfil completo del usuario autenticado, incluyendo sus roles."""
        with UsuarioUoW(self._session) as uow:
            usuario = self._get_or_404(uow, usuario_id)
            roles = uow.usuarios.get_roles(usuario_id)

        return UsuarioDetailResponse(
            id=usuario.id,
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            email=usuario.email,
            celular=usuario.celular,
            is_active=usuario.is_active,
            created_at=usuario.created_at,
            roles=roles,
        )

    def update_me(self, usuario_id: int, data: UsuarioUpdateRequest) -> UsuarioResponse:
        """Actualiza el perfil del usuario autenticado (nombre, apellido, celular)."""
        with UsuarioUoW(self._session) as uow:
            usuario = self._get_or_404(uow, usuario_id)

            cambios = data.model_dump(exclude_unset=True)
            for key, value in cambios.items():
                setattr(usuario, key, value)
            usuario.updated_at = datetime.now(timezone.utc)
            uow.usuarios.update(usuario)

        self._session.refresh(usuario)
        return UsuarioResponse(
            id=usuario.id,
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            email=usuario.email,
            celular=usuario.celular,
            is_active=usuario.is_active,
            created_at=usuario.created_at,
        )

    def get_all(self, skip: int = 0, limit: int = 20, include_deleted: bool = False, rol: Optional[str] = None) -> tuple[list[UsuarioDetailResponse], int]:
        """Lista todos los usuarios no eliminados permanentemente. Solo para ADMIN."""
        with UsuarioUoW(self._session) as uow:
            usuarios, total = uow.usuarios.get_all_active_paginated(skip, limit, include_deleted, rol)

        result = []
        for u in usuarios:
            roles = self._get_roles(u.id)
            result.append(
                UsuarioDetailResponse(
                    id=u.id,
                    nombre=u.nombre,
                    apellido=u.apellido,
                    email=u.email,
                    celular=u.celular,
                    is_active=u.is_active,
                    deleted_at=u.deleted_at,
                    created_at=u.created_at,
                    roles=roles,
                )
            )
        return result, total

    def exportar(self) -> bytes:
        import io
        import openpyxl

        # Buscamos absolutamente todos los usuarios, incluyendo eliminados lógicos (deleted_at)
        items, _ = self.get_all(0, 10000, include_deleted=True)

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Usuarios"

        headers = ["ID", "Nombre", "Apellido", "Email", "Celular", "Estado", "Roles", "Fecha de Registro", "Fecha de Anulación"]
        ws.append(headers)

        for item in items:
            # Determinamos el estado del usuario de forma amigable
            if item.deleted_at:
                estado = "Anulado (Soft Delete)"
            elif item.is_active:
                estado = "Activo"
            else:
                estado = "Suspendido"

            fecha_anulacion = item.deleted_at.strftime("%Y-%m-%d %H:%M") if item.deleted_at else ""

            ws.append([
                item.id,
                item.nombre,
                item.apellido,
                item.email,
                item.celular or "",
                estado,
                ", ".join(item.roles),
                item.created_at.strftime("%Y-%m-%d %H:%M"),
                fecha_anulacion,
            ])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.read()

    def toggle_active(self, usuario_id: int, current_user_id: int) -> UsuarioResponse:
        """
        Alterna el estado is_active del usuario.
        Un admin NO puede suspenderse a sí mismo.
        """
        if usuario_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés suspender tu propia cuenta.",
            )

        with UsuarioUoW(self._session) as uow:
            usuario = self._get_or_404(uow, usuario_id)
            usuario.is_active = not usuario.is_active
            usuario.updated_at = datetime.now(timezone.utc)
            uow.usuarios.update(usuario)

        self._session.refresh(usuario)
        return UsuarioResponse(
            id=usuario.id,
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            email=usuario.email,
            celular=usuario.celular,
            is_active=usuario.is_active,
            created_at=usuario.created_at,
        )

    def update_roles(self, usuario_id: int, data: UsuarioRoleUpdateRequest, current_user_id: int) -> UsuarioDetailResponse:
        """Modifica los roles de un usuario. Protegido contra auto-modificación de admin."""
        if usuario_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes modificar tus propios roles.",
            )

        with UsuarioUoW(self._session) as uow:
            usuario = self._get_or_404(uow, usuario_id)

            # Borrar todos los roles actuales vía repositorio
            uow.roles.delete_by_usuario(usuario_id)

            # Insertar nuevos roles vía repositorio
            # Si se envía una lista vacía, el usuario se queda sin roles (no recomendado pero posible)
            for rol in set(data.roles):
                uow.roles.add_rol(usuario_id=usuario_id, rol_codigo=rol)
            # El __exit__ del UoW hace commit al salir sin excepción

        return self.get_me(usuario_id)

    def eliminar(self, usuario_id: int, current_user_id: int) -> None:
        """
        Soft delete de un usuario. El registro queda en BD pero desaparece de las listas normales.
        Un admin no puede eliminarse a sí mismo.
        """
        if usuario_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés eliminar tu propia cuenta.",
            )

        with UsuarioUoW(self._session) as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if not usuario or usuario.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Usuario con id={usuario_id} no encontrado.",
                )
            uow.usuarios.soft_delete(usuario)
            # __exit__ del UoW hace commit

    def crear_administrativo(self, data: UsuarioCreateRequest, current_user_id: int) -> UsuarioDetailResponse:
        """
        Permite a un administrador crear un nuevo usuario con roles específicos directamente.
        """
        from app.core.security import get_password_hash

        if not data.roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe asignar al menos un rol al usuario.",
            )

        with UsuarioUoW(self._session) as uow:
            # Verificar si ya existe el email
            existing = uow.usuarios.get_by_email(data.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe un usuario registrado con ese email.",
                )

            # Crear usuario vía repositorio (add hace flush + refresh internamente)
            nuevo = Usuario(
                nombre=data.nombre,
                apellido=data.apellido,
                email=data.email,
                celular=data.celular,
                password_hash=get_password_hash(data.password),
                is_active=True,
            )
            uow.usuarios.add(nuevo)

            # Asignar roles vía repositorio
            for rol_cod in set(data.roles):
                uow.roles.add_rol(
                    usuario_id=nuevo.id,
                    rol_codigo=rol_cod,
                    asignado_por_id=current_user_id,
                )

            # El context manager de UoW hará commit de todo al salir

        return self.get_me(nuevo.id)

    def restaurar(self, usuario_id: int, current_user_id: int) -> UsuarioDetailResponse:
        """
        Restaura un usuario eliminado lógicamente (deleted_at = None).
        """
        if usuario_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes operar sobre tu propia cuenta.",
            )

        with UsuarioUoW(self._session) as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if not usuario:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Usuario con id={usuario_id} no encontrado.",
                )

            usuario.deleted_at = None
            usuario.is_active = True
            usuario.updated_at = datetime.now(timezone.utc)
            uow.usuarios.update(usuario)
            # commit ocurre al salir del with

        # Recargamos fresh desde DB para evitar problemas de identity map
        self._session.refresh(usuario)
        roles = self._get_roles(usuario_id)
        return UsuarioDetailResponse(
            id=usuario.id,
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            email=usuario.email,
            celular=usuario.celular,
            is_active=usuario.is_active,
            deleted_at=usuario.deleted_at,
            created_at=usuario.created_at,
            roles=roles,
        )
