from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query, status, UploadFile, File, HTTPException
from pydantic import BaseModel as _BaseModel
from sqlmodel import Session
from app.core.cloudinary import upload_image
from app.core.database import get_session
from app.core.dependencies import require_role
from app.modules.productos.schemas import (
    ProductoCreate, ProductoUpdate, ProductoDisponibilidadUpdate,
    ProductoRead, ProductoReadDetalle,
    ProductoIngredienteCreate, ProductoIngredienteRead,
    UnidadMedidaCreate, UnidadMedidaUpdate, UnidadMedidaRead,
)
from app.modules.productos.service import ProductoService, UnidadMedidaService

router = APIRouter(tags=["Productos"])
SessionDep = Annotated[Session, Depends(get_session)]

# ── UnidadMedida ─────────────────────────────────────────────────────────────

@router.get("/unidades-medida/", response_model=list[UnidadMedidaRead])
def listar_unidades_medida(session: SessionDep):
    return UnidadMedidaService(session).listar()

@router.get("/unidades-medida/{id}", response_model=UnidadMedidaRead)
def obtener_unidad_medida(id: int, session: SessionDep):
    return UnidadMedidaService(session).obtener(id)

@router.post("/unidades-medida/", response_model=UnidadMedidaRead)
def crear_unidad_medida(data: UnidadMedidaCreate, session: SessionDep, _u: dict = Depends(require_role("ADMIN", "ENCARGADO"))):
    return UnidadMedidaService(session).crear(data)

@router.patch("/unidades-medida/{id}", response_model=UnidadMedidaRead)
def actualizar_unidad_medida(id: int, data: UnidadMedidaUpdate, session: SessionDep, _u: dict = Depends(require_role("ADMIN", "ENCARGADO"))):
    return UnidadMedidaService(session).actualizar(id, data)

@router.delete("/unidades-medida/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_unidad_medida(id: int, session: SessionDep, _u: dict = Depends(require_role("ADMIN", "ENCARGADO"))):
    UnidadMedidaService(session).eliminar(id)

# ── Productos ─────────────────────────────────────────────────────────────────

@router.get("/productos/", response_model=list[ProductoReadDetalle])
def listar_productos(
    session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=1000)] = 20,
    disponible: Annotated[Optional[bool], Query()] = None,
    include_deleted: Annotated[bool, Query()] = False,
    categoria_id: Annotated[Optional[int], Query()] = None,
    search: Annotated[Optional[str], Query()] = None,
):
    return ProductoService(session).listar(
        offset=offset, limit=limit, disponible=disponible,
        include_deleted=include_deleted, categoria_id=categoria_id, search=search,
    )

@router.get("/productos/{id}", response_model=ProductoReadDetalle)
def obtener_producto(id: int, session: SessionDep):
    return ProductoService(session).obtener(id)

@router.post("/productos/", response_model=ProductoRead)
def crear_producto(data: ProductoCreate, session: SessionDep, _u: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK"))):
    return ProductoService(session).crear(data)

@router.put("/productos/{id}", response_model=ProductoRead)
def actualizar_producto(id: int, data: ProductoUpdate, session: SessionDep, _u: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK"))):
    return ProductoService(session).actualizar(id, data)

@router.patch("/productos/{id}/disponibilidad", response_model=ProductoRead, dependencies=[Depends(require_role("ADMIN", "ENCARGADO", "STOCK"))])
def actualizar_disponibilidad_producto(id: int, data: ProductoDisponibilidadUpdate, session: SessionDep):
    return ProductoService(session).actualizar_disponibilidad(id, data)

@router.delete("/productos/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(id: int, session: SessionDep, _u: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK"))):
    ProductoService(session).eliminar(id)

@router.patch("/productos/{id}/reactivar", response_model=ProductoRead)
def reactivar_producto(id: int, session: SessionDep, _u: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK"))):
    return ProductoService(session).reactivar(id)

@router.post("/productos/upload", status_code=status.HTTP_200_OK)
def subir_imagen_producto(file: UploadFile = File(...), _u: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK"))):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo proporcionado no es una imagen válida.")
    try:
        content = file.file.read()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"No se pudo leer el archivo: {e}")
    return {"url": upload_image(content)}

# ── Ingredientes del producto ─────────────────────────────────────────────────

@router.get("/productos/{id}/ingredientes", response_model=list[ProductoIngredienteRead])
def listar_ingredientes_producto(id: int, session: SessionDep):
    return ProductoService(session).listar_ingredientes(id)

@router.post("/productos/{id}/ingredientes", response_model=ProductoIngredienteRead)
def asociar_ingrediente(id: int, data: ProductoIngredienteCreate, session: SessionDep, _u: dict = Depends(require_role("ADMIN", "ENCARGADO", "STOCK"))):
    return ProductoService(session).asociar_ingrediente(id, data)

# ── Imágenes del producto ─────────────────────────────────────────────────────

class ImagenProductoUpdate(_BaseModel):
    imagenes_url: list[str]

@router.patch("/productos/{id}/imagenes", response_model=ProductoRead)
def actualizar_imagenes_producto(id: int, data: ImagenProductoUpdate, session: SessionDep, _u: dict = Depends(require_role("ADMIN"))):
    return ProductoService(session).actualizar_imagenes(id, data.imagenes_url)
