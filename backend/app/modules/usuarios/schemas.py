from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel


class UsuarioResponse(SQLModel):
    """
    Respuesta pública de un usuario.
    NUNCA incluye password_hash.
    - is_active = False → Pausado (visible en admin con etiqueta "Inactivo")
    - deleted_at != None → Eliminado (oculto en listas normales)
    """
    id: int
    nombre: str
    apellido: str
    email: str
    celular: Optional[str] = None
    is_active: bool
    deleted_at: Optional[datetime] = None  # None = activo o pausado, fecha = eliminado
    created_at: datetime


class UsuarioDetailResponse(UsuarioResponse):
    """
    Respuesta extendida con roles del usuario.
    Se usa en GET /me para que el usuario conozca sus permisos.
    """
    roles: list[str]


class UsuarioUpdateRequest(SQLModel):
    """
    Datos editables por el propio usuario.
    El email NO es modificable aquí (requiere flujo de verificación separado).
    """
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    celular: Optional[str] = None


class UsuarioRoleUpdateRequest(SQLModel):
    """
    Datos para modificar los roles de un usuario (solo ADMIN).
    """
    roles: list[str]


class UsuarioListResponse(SQLModel):
    items: list[UsuarioDetailResponse]
    total: int
    skip: int
    limit: int


class UsuarioCreateRequest(SQLModel):
    """
    Datos requeridos para dar de alta administrativamente a un nuevo usuario.
    Exclusivo para uso del ADMIN en el panel de control.
    """
    nombre: str
    apellido: str
    email: str
    celular: Optional[str] = None
    password: str
    roles: list[str]

