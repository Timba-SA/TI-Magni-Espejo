# Verification — Change 005 — Soft Delete Estandarizado

**Estado:** ✅ Done  
**Fecha:** 2026-05-12

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `categorias/schemas.py` | `CategoriaRead` + `deleted_at: Optional[datetime]` |
| `productos/schemas.py` | `ProductoRead` + `deleted_at: Optional[datetime]` |
| `usuarios/schemas.py` | `UsuarioResponse` + `deleted_at: Optional[datetime]`, docstring semántico |
| `categorias/repository.py` | `get_all_activas_paginated` acepta `include_deleted` |
| `productos/repository.py` | `get_all_activos` y `count_activos` aceptan `include_deleted` |
| `usuarios/repository.py` | `get_all_active_paginated` acepta `include_deleted` |
| `categorias/service.py` | `listar()` + flag, `eliminar()` usa `soft_delete()` |
| `productos/service.py` | `listar()` + flag, `eliminar()` usa `soft_delete()` |
| `usuarios/service.py` | `get_all()` + flag, nuevo `eliminar()` con anti-autoborrado |
| `categorias/router.py` | `GET /` + query param `include_deleted` |
| `productos/router.py` | `GET /` + query param `include_deleted` |
| `usuarios/router.py` | `GET /` + query param `include_deleted`, nuevo `DELETE /{id}` |

## Semántica final

| Estado | Campo | Visibilidad admin | Visibilidad cliente |
|---|---|---|---|
| Activo | `deleted_at=None`, `is_active=True` | ✅ Visible | ✅ Visible |
| Pausado | `deleted_at=None`, `is_active=False` | ✅ Visible (etiqueta "Inactivo") | ❌ Oculto |
| Eliminado | `deleted_at!=None` | ❌ Solo con `include_deleted=true` | ❌ Oculto |

## Notas
- Se usa `BaseRepository.soft_delete()` (ya existente) en lugar de asignación directa de `deleted_at`.
- El commit sigue siendo responsabilidad exclusiva del `__exit__` del UoW.
- El endpoint `DELETE /usuarios/{id}` sigue el mismo patrón de protección que `toggle-active`.
