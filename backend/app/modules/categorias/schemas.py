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
    created_at: datetime
    updated_at: datetime
