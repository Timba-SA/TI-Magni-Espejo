from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Optional
from datetime import datetime

def to_camel(string: str) -> str:
    components = string.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

class InsumoBase(BaseModel):
    nombre: str = Field(..., min_length=1)
    descripcion: Optional[str] = None
    categoria: str = Field(..., min_length=1)
    unidad_medida: str = Field(..., min_length=1, alias="unidadMedida")
    stock_actual: float = Field(0, ge=0, alias="stockActual")
    stock_minimo: float = Field(0, ge=0, alias="stockMinimo")
    precio_unitario: float = Field(0, ge=0, alias="precioUnitario")
    estado: str = Field("Activo", pattern="^(Activo|Inactivo)$")

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

    @model_validator(mode='after')
    def clean_description(self):
        if self.descripcion is not None:
            self.descripcion = self.descripcion.strip()
        return self

class InsumoCreate(InsumoBase):
    pass

class InsumoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1)
    descripcion: Optional[str] = None
    categoria: Optional[str] = Field(None, min_length=1)
    unidad_medida: Optional[str] = Field(None, min_length=1, alias="unidadMedida")
    stock_actual: Optional[float] = Field(None, ge=0, alias="stockActual")
    stock_minimo: Optional[float] = Field(None, ge=0, alias="stockMinimo")
    precio_unitario: Optional[float] = Field(None, ge=0, alias="precioUnitario")
    estado: Optional[str] = Field(None, pattern="^(Activo|Inactivo)$")

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)

class InsumoResponse(InsumoBase):
    id: int
    fecha_alta: datetime = Field(..., alias="fechaAlta")
    fecha_actualizacion: Optional[datetime] = Field(None, alias="fechaActualizacion")
    stock_bajo: bool = Field(False, alias="stockBajo")
    valor_stock: float = Field(0, alias="valorStock")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

class InsumosStatsResponse(BaseModel):
    total: int
    activos: int
    inactivos: int
    stock_bajo: int = Field(..., alias="stockBajo")
    valor_inventario: float = Field(..., alias="valorInventario")

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)
