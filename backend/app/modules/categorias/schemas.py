from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


# ─── Categoria ────────────────────────────────────────────────────────────────

class CategoriaCreate(SQLModel):
    parent_id: Optional[int] = None
    nombre: str
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None


class CategoriaUpdate(SQLModel):
    parent_id: Optional[int] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None


class CategoriaRead(SQLModel):
    id: int
    parent_id: Optional[int]
    nombre: str
    descripcion: Optional[str]
    imagen_url: Optional[str]
    is_active: bool  # False = Inhabilitada (visible en admin con etiqueta)
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None  # None = activa, fecha = archivada


class CategoriaListResponse(SQLModel):
    items: list[CategoriaRead]
    total: int
    skip: int
    limit: int
