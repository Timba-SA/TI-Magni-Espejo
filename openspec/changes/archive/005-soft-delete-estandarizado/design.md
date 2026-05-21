# Design — Change 005 — Soft Delete Estandarizado

## 1. Schemas (contratos con el frontend)

### CategoriaRead — añadir campos de estado
```python
class CategoriaRead(SQLModel):
    # existentes ...
    deleted_at: Optional[datetime] = None   # NUEVO: para que el frontend sepa si está archivada
```

### ProductoRead — añadir campos de estado
```python
class ProductoRead(SQLModel):
    # existentes ...
    deleted_at: Optional[datetime] = None   # NUEVO
    # disponible ya existe (equivale a is_active para productos)
```

### UsuarioResponse — añadir deleted_at
```python
class UsuarioResponse(SQLModel):
    # existentes ...
    deleted_at: Optional[datetime] = None   # NUEVO: el frontend puede mostrar "Eliminado"
```

---

## 2. Repositories — uso de soft_delete() ya existente en BaseRepository

Los servicios actualmente asignan `deleted_at` manualmente.  
Se reemplazará por `uow.<repo>.soft_delete(obj)` (ya implementado en `BaseRepository`).

### Categorias
- `CategoriaRepository.get_all_activas_paginated` → ya filtra `deleted_at == None` ✅
- Se añade `get_all_paginated(skip, limit)` → **sin filtro**, para ver archivadas

### Productos
- `ProductoRepository.get_all_activos` → ya filtra `deleted_at == None` ✅
- Se añade `count_activos` con filtro por `disponible` opcional

### Usuarios
- `UsuarioRepository.get_all_active_paginated` → ya filtra `deleted_at == None` ✅
- Se añade `soft_delete` (heredado de base, no requiere código nuevo)

---

## 3. Services — métodos refactorizados

### CategoriaService
- `eliminar(id)` → usar `uow.categorias.soft_delete(categoria)` en lugar de asignación manual
- `listar(skip, limit, include_deleted=False)` → pasar flag al repository

### ProductoService
- `eliminar(id)` → usar `uow.productos.soft_delete(producto)`
- `listar(offset, limit, disponible, include_deleted=False)` → pasar flag

### UsuarioService
- `eliminar(id, current_user_id)` → nuevo método con soft delete + protección anti-autoborrado
- `get_all(skip, limit, include_deleted=False)` → pasar flag al repository

---

## 4. Routers — nuevos query params y endpoints

### Categorias
- `GET /categorias/?include_deleted=false` → query param opcional
- `DELETE /categorias/{id}` → 204 (ya existe, solo delega al servicio refactorizado)

### Productos
- `GET /productos/?include_deleted=false` → query param opcional
- `DELETE /productos/{id}` → 204 (ya existe)

### Usuarios
- `GET /usuarios/?include_deleted=false` → query param opcional
- `DELETE /usuarios/{id}` → **NUEVO endpoint** 204, solo ADMIN
