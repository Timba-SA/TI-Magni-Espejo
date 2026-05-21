# Tasks — Change 005 — Soft Delete Estandarizado

## Schemas
- [x] `categorias/schemas.py` → añadir `deleted_at: Optional[datetime]` a `CategoriaRead`
- [x] `productos/schemas.py` → añadir `deleted_at: Optional[datetime]` a `ProductoRead`
- [x] `usuarios/schemas.py` → añadir `deleted_at: Optional[datetime]` a `UsuarioResponse`

## Services
- [x] `categorias/service.py` → `eliminar()` usar `soft_delete()` del BaseRepository
- [x] `categorias/service.py` → `listar()` aceptar `include_deleted: bool = False`
- [x] `productos/service.py` → `eliminar()` usar `soft_delete()`
- [x] `productos/service.py` → `listar()` aceptar `include_deleted: bool = False`
- [x] `usuarios/service.py` → nuevo método `eliminar(id, current_user_id)`
- [x] `usuarios/service.py` → `get_all()` aceptar `include_deleted: bool = False`

## Repositories
- [x] `categorias/repository.py` → `get_all_activas_paginated` aceptar flag `include_deleted`
- [x] `productos/repository.py` → `get_all_activos` aceptar flag `include_deleted`
- [x] `usuarios/repository.py` → `get_all_active_paginated` aceptar flag `include_deleted`

## Routers
- [x] `categorias/router.py` → query param `include_deleted` en `GET /`
- [x] `productos/router.py` → query param `include_deleted` en `GET /`
- [x] `usuarios/router.py` → query param `include_deleted` en `GET /`
- [x] `usuarios/router.py` → nuevo endpoint `DELETE /{id}` (solo ADMIN)
