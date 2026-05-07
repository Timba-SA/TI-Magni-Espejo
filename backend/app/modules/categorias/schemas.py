from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

def to_camel(string: str) -> str:
    components = string.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

class CategoriaCreate(BaseModel):
    nombre: str = Field(..., min_length=1)
    descripcion: Optional[str] = None

class CategoriaResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    fecha_alta: datetime = Field(..., alias="fechaAlta")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)
