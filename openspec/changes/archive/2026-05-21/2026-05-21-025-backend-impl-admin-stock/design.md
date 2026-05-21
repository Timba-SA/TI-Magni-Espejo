# Diseño Técnico (Design Document)
**ID del Cambio:** 025-backend-impl-admin-stock
**Contexto:** Gestión de Stock y Disponibilidad de Productos (Backend)

---

## 1. Especificación del Endpoint API

Implementaremos un nuevo endpoint específico dentro del módulo de productos:

### `PATCH /api/v1/productos/{id}/disponibilidad`

* **Propósito:** Actualiza el stock físico y/o el flag de disponibilidad comercial de un producto.
* **Seguridad:** Requiere token Bearer JWT válido. El usuario autenticado debe poseer el rol `ADMIN` o el rol `STOCK`.
* **Cuerpo de Petición (Request Body):**
  ```json
  {
    "stock_cantidad": 15,
    "disponible": false
  }
  ```
  *(Ambos campos son opcionales en el payload. Si se omite uno, no se altera su valor actual en la base de datos).*
* **Códigos de Respuesta:**
  * `200 OK`: Actualización exitosa. Retorna el producto actualizado con el esquema `ProductoRead`.
  * `400 Bad Request`: Si `stock_cantidad` es negativo o el payload está vacío.
  * `401 Unauthorized`: Si no se provee token o es inválido.
  * `403 Forbidden`: Si el usuario autenticado no tiene rol `ADMIN` o `STOCK`.
  * `404 Not Found`: Si el producto con el ID especificado no existe o tiene la fecha `deleted_at` cargada (borrado lógico).

---

## 2. Componentes a Desarrollar/Modificar

### A. Esquema de Pydantic (`backend/app/modules/productos/schemas.py`)
Crearemos un esquema nuevo dedicado para la petición:
```python
class ProductoDisponibilidadUpdate(SQLModel):
    stock_cantidad: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = Field(default=None)
```

### B. Servicio (`backend/app/modules/productos/service.py`)
Agregaremos la función `actualizar_disponibilidad` en `ProductoService`:
* **Firma:** `def actualizar_disponibilidad(self, producto_id: int, data: ProductoDisponibilidadUpdate) -> Producto`
* **Lógica:**
  1. Abrir bloque transaccional con `ProductoUoW`.
  2. Obtener el producto usando el repositorio de productos.
  3. Lanza `HTTPException(404)` si el producto no existe o tiene `deleted_at is not None`.
  4. Si `data.stock_cantidad is not None`, se actualiza `producto.stock_cantidad = data.stock_cantidad`.
  5. Si `data.disponible is not None`, se actualiza `producto.disponible = data.disponible`.
  6. Actualizar el campo de auditoría `producto.updated_at = datetime.utcnow()`.
  7. Persistir y confirmar los cambios en la base de datos a través del UoW.
  8. Retornar el objeto `Producto` refrescado.

### C. Rutas (`backend/app/modules/productos/router.py`)
Agregaremos el endpoint PATCH protegiéndolo con la dependencia de roles:
```python
from app.core.dependencies import require_role

@router.patch(
    "/productos/{id}/disponibilidad",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role("ADMIN", "STOCK"))]
)
def actualizar_disponibilidad_producto(
    id: int,
    data: ProductoDisponibilidadUpdate,
    session: SessionDep
):
    return ProductoService(session).actualizar_disponibilidad(id, data)
```
*(Se usa `dependencies` a nivel de decorador para asegurar la validación sin necesidad de inyectar el payload del usuario en la función si no se utiliza).*
