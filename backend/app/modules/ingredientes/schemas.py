from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


# ─── Ingrediente ──────────────────────────────────────────────────────────────

class IngredienteCreate(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    es_alergeno: bool = False


class IngredienteUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    es_alergeno: Optional[bool] = None


class IngredienteRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    es_alergeno: bool
    created_at: datetime
    updated_at: datetime
