# Design: Change 018 — Backend: Gestión de Usuarios

## Arquitectura

Sigue estrictamente el patrón en capas del proyecto:
```
Router → Service → UnitOfWork → Repository → SQLModel
```

## Modelo: `is_active`

El modelo `Usuario` actual tiene `deleted_at` pero NO tiene `is_active`. Para la funcionalidad de "suspender usuario" necesitamos agregar:

```python
is_active: bool = Field(default=True, nullable=False)
```

**Razón**: `deleted_at` representa eliminación lógica permanente. `is_active` representa una suspensión reversible. Para el panel admin, suspender/reactivar es más seguro y útil que soft-delete.

> **Alerta de migración**: al agregar `is_active`, SQLite puede requerir recrear la tabla o ejecutar `ALTER TABLE usuarios ADD COLUMN is_active BOOLEAN DEFAULT 1`. El seed debe ejecutarse después.

## Schemas (`schemas.py`)

```python
class UsuarioResponse(SQLModel):
    id: int
    nombre: str
    apellido: str
    email: str
    celular: Optional[str]
    is_active: bool
    created_at: datetime

class UsuarioDetailResponse(UsuarioResponse):
    roles: list[str]   # ["ADMIN", "CLIENTE"]

class UsuarioUpdateRequest(SQLModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    celular: Optional[str] = None
```

## Repository (`repository.py`)

`UsuarioRepository(BaseRepository[Usuario])` con métodos extra:
- `get_by_email(email)` → busca por email (para login)
- `get_all_active()` → filtra `deleted_at IS NULL` (usuarios no eliminados)
- Hereda `soft_delete()` de `BaseRepository`

## UnitOfWork (`unit_of_work.py`)

```python
class UsuarioUoW(UnitOfWork):
    def __init__(self, session):
        super().__init__(session)
        self.usuarios = UsuarioRepository(session)
```

## Service (`service.py`)

`UsuarioService(session)` con métodos:

| Método | Rol requerido | Descripción |
|---|---|---|
| `get_me(usuario_id)` | Cualquier autenticado | Devuelve `UsuarioDetailResponse` con roles |
| `update_me(usuario_id, data)` | Cualquier autenticado | Actualiza nombre/apellido/celular |
| `get_all()` | ADMIN | Lista usuarios activos (no soft-deleted) |
| `toggle_active(id)` | ADMIN | Alterna `is_active` del usuario |

**Regla de seguridad**: en `toggle_active`, no se puede desactivar a uno mismo.

## Router (`router.py`)

```
prefix="/api/v1/usuarios", tags=["Usuarios"]
```

Dependencias:
- `get_current_user` → cualquier endpoint autenticado
- `require_admin` → endpoints de admin

```
GET  /me                   → UsuarioDetailResponse
PATCH /me                  → UsuarioResponse
GET  /                     → list[UsuarioResponse]  [admin]
PATCH /{id}/toggle-active  → UsuarioResponse        [admin]
```

## Frontend: `UsersPage.tsx`

- Tabla con columnas: `#ID`, `Nombre`, `Email`, `Rol`, `Estado` (badge verde/rojo), `Acciones`
- Botón de toggle (activar/suspender) con confirmación inline
- Conectada a los endpoints del backend vía `usuariosService.ts`
- Temática: usa variables CSS `--tfs-*` igual que `CategoriasPage`

## Dependencias

- `backend/app/modules/auth/dependencies.py` → debe exportar `require_admin` (verificar si existe)
- `backend/app/main.py` → el router de usuarios debe estar registrado
