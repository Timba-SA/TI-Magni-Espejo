# Technical Design: Backend - Implementación de Direcciones de Entrega

Este documento describe la arquitectura, diseño técnico y modelo de datos para la implementación del módulo de direcciones de entrega en The Food Store.

---

## 1. Arquitectura de Módulos (Screaming Architecture)

El backend sigue una arquitectura limpia en capas organizada por características (features). Se creará el módulo completo en `backend/app/modules/direcciones/` conteniendo:

```
backend/app/modules/direcciones/
├── __init__.py
├── models.py          # Definición de la entidad SQLModel
├── schemas.py         # Validadores Pydantic (Request/Response)
├── repository.py      # Operaciones CRUD sobre DB (SQLAlchemy/SQLModel)
├── unit_of_work.py    # Gestión de transacciones atómicas
├── service.py         # Lógica de negocio (Ownership, Principal, Active Orders check)
└── router.py          # Endpoints HTTP expuestos mediante APIRouter
```

---

## 2. Modelo de Datos (`DireccionEntrega`)

Se define la clase `DireccionEntrega` en `backend/app/modules/direcciones/models.py`:

```python
from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario

class DireccionEntrega(SQLModel, table=True):
    __tablename__ = "direcciones_entrega"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", nullable=False)
    
    alias: Optional[str] = Field(default=None, max_length=50)
    linea1: str = Field(nullable=False)
    linea2: Optional[str] = Field(default=None)
    ciudad: str = Field(max_length=100, nullable=False)
    provincia: Optional[str] = Field(default=None, max_length=100)
    codigo_postal: Optional[str] = Field(default=None, max_length=10)
    
    latitud: Optional[Decimal] = Field(default=None, decimal_places=6, max_digits=9)
    longitud: Optional[Decimal] = Field(default=None, decimal_places=6, max_digits=9)
    
    es_principal: bool = Field(default=False, nullable=False)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    deleted_at: Optional[datetime] = Field(default=None)

    # Relación con Usuario
    usuario: Optional["Usuario"] = Relationship()
```

---

## 3. Lógica de Negocio Crítica

### A. Dirección Principal Única (Transaccional)
Cuando un usuario crea una dirección o la establece como principal, se debe garantizar atómicamente que las demás direcciones del mismo usuario queden con `es_principal = False`.
Esto se implementará en `DireccionService` coordinado con `DireccionUoW`:

```python
# Lógica conceptual en Service
def set_principal(self, direccion_id: int, usuario_id: int) -> DireccionResponse:
    with DireccionUoW(self._session) as uow:
        # 1. Obtener y verificar propiedad
        direccion = uow.direcciones.get_by_id_and_user(direccion_id, usuario_id)
        if not direccion:
            raise HTTPException(status_code=404, detail="Dirección no encontrada")
        
        # 2. Desmarcar todas las demás direcciones del usuario como principales
        uow.direcciones.desmarcar_principales_previas(usuario_id)
        
        # 3. Establecer esta como principal
        direccion.es_principal = True
        direccion.updated_at = datetime.utcnow()
        uow.direcciones.update(direccion)
        # uow realiza commit transaccional atómico
```

### B. Validación de Pedidos Activos (Soft Delete Constraint)
Dado que el modelo `Pedido` será implementado en el Change `023`, la lógica de validación de pedidos activos se diseñará de forma modular:
- Se implementará un método de marcador de posición (placeholder) `uow.direcciones.tiene_pedidos_activos(direccion_id) -> bool` que actualmente retornará `False` (ya que no existe la tabla `pedidos`).
- Se dejará un comentario explicativo e instructivo para realizar la integración relacional exacta en el Change `023` cuando se cree la tabla de pedidos.

---

## 4. Endpoints y Seguridad

El router `/api/v1/direcciones` requerirá autenticación JWT a través de la dependencia `get_current_user`.
- `GET /` -> Llama a `service.get_mis_direcciones(usuario.id)`. Retorna lista de direcciones activas (`deleted_at IS NULL`).
- `POST /` -> Llama a `service.crear(usuario.id, data)`. Si es la primera dirección activa del usuario, asigna `es_principal = True`.
- `PUT /{id}` -> Llama a `service.actualizar(id, usuario.id, data)`. Valida ownership.
- `PATCH /{id}/principal` -> Llama a `service.set_principal(id, usuario.id)`. Valida ownership y aplica alternancia transaccional.
- `DELETE /{id}` -> Llama a `service.eliminar(id, usuario.id)`. Valida ownership, verifica restricciones de pedidos y ejecuta soft-delete (`deleted_at = now()`).
