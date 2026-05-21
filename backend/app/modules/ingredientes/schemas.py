from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel
from app.modules.productos.schemas_medida import UnidadMedidaRead


class IngredienteCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    es_alergeno: bool = False
    unidad_medida_id: Optional[int] = None
    stock_actual: Decimal = Decimal("0.000")
    stock_minimo: Decimal = Decimal("0.000")
    costo_unitario: Decimal = Decimal("0.00")


class IngredienteUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    es_alergeno: Optional[bool] = None
    unidad_medida_id: Optional[int] = None
    stock_actual: Optional[Decimal] = None
    stock_minimo: Optional[Decimal] = None
    costo_unitario: Optional[Decimal] = None


class IngredienteRead(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    es_alergeno: bool
    is_active: bool  # False = Inhabilitado (visible en admin con etiqueta)
    unidad_medida_id: Optional[int] = None
    stock_actual: Decimal
    stock_minimo: Decimal
    costo_unitario: Decimal
    unidad_medida: Optional[UnidadMedidaRead] = None
    deleted_at: Optional[datetime] = None  # None = activo, fecha = archivado
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IngredienteListResponse(BaseModel):
    items: list[IngredienteRead]
    total: int
    skip: int
    limit: int
