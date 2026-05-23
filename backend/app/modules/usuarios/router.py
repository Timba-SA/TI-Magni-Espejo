from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from app.core.database import get_session
from app.core.dependencies import get_current_user, require_role
from app.modules.usuarios.schemas import (
    UsuarioDetailResponse,
    UsuarioResponse,
    UsuarioRoleUpdateRequest,
    UsuarioUpdateRequest,
    UsuarioListResponse,
    UsuarioCreateRequest,
)

from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[dict, Depends(get_current_user)]
AdminOnly = Annotated[dict, Depends(require_role("ADMIN"))]


@router.get("/me", response_model=UsuarioDetailResponse, status_code=status.HTTP_200_OK)
def get_me(session: SessionDep, current_user: CurrentUser):
    """Devuelve el perfil completo del usuario autenticado."""
    usuario_id = current_user["sub"]
    return UsuarioService(session).get_me(usuario_id)


@router.patch("/me", response_model=UsuarioResponse, status_code=status.HTTP_200_OK)
def update_me(data: UsuarioUpdateRequest, session: SessionDep, current_user: CurrentUser):
    """Actualiza el perfil del usuario autenticado (nombre, apellido, celular)."""
    usuario_id = current_user["sub"]
    return UsuarioService(session).update_me(usuario_id, data)


@router.get("/", response_model=UsuarioListResponse, status_code=status.HTTP_200_OK)
def get_all(
    session: SessionDep,
    _admin: AdminOnly,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    include_deleted: Annotated[bool, Query(description="Incluir usuarios eliminados (solo admin)")] = False,
    rol: Annotated[Optional[str], Query(description="Filtrar por rol")] = None,
):
    """Lista todos los usuarios. Incluye activos y pausados. Solo ADMIN."""
    items, total = UsuarioService(session).get_all(skip, limit, include_deleted, rol)
    return UsuarioListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/exportar", status_code=status.HTTP_200_OK)
def exportar_usuarios(session: SessionDep, _admin: AdminOnly):
    """Exporta todos los usuarios en formato Excel. Solo ADMIN."""
    file_bytes = UsuarioService(session).exportar()
    return StreamingResponse(
        content=iter([file_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=usuarios.xlsx"},
    )


@router.patch("/{id}/toggle-active", response_model=UsuarioResponse, status_code=status.HTTP_200_OK)
def toggle_active(id: int, session: SessionDep, current_user: AdminOnly):
    """Activa o suspende un usuario. Solo ADMIN. No puede aplicarse a uno mismo."""
    admin_id = current_user["sub"]
    return UsuarioService(session).toggle_active(id, admin_id)


@router.patch("/{id}/roles", response_model=UsuarioDetailResponse, status_code=status.HTTP_200_OK)
def update_roles(id: int, data: UsuarioRoleUpdateRequest, session: SessionDep, current_user: AdminOnly):
    """Actualiza los roles de un usuario. Solo ADMIN. No puede aplicarse a uno mismo."""
    admin_id = current_user["sub"]
    return UsuarioService(session).update_roles(id, data, admin_id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(id: int, session: SessionDep, current_user: AdminOnly):
    """Soft delete de un usuario. El registro se archiva (deleted_at). Solo ADMIN. No puede aplicarse a uno mismo."""
    admin_id = current_user["sub"]
    UsuarioService(session).eliminar(id, admin_id)


@router.post("/", response_model=UsuarioDetailResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    data: UsuarioCreateRequest,
    session: SessionDep,
    current_user: AdminOnly,
):
    """Permite a un administrador crear un nuevo usuario con roles asignados. Solo ADMIN."""
    admin_id = current_user["sub"]
    return UsuarioService(session).crear_administrativo(data, admin_id)


@router.patch("/{id}/restore", response_model=UsuarioDetailResponse, status_code=status.HTTP_200_OK)
def restaurar_usuario(
    id: int,
    session: SessionDep,
    current_user: AdminOnly,
):
    """Restaura un usuario eliminado lógicamente (soft delete). Solo ADMIN."""
    admin_id = current_user["sub"]
    return UsuarioService(session).restaurar(id, admin_id)

