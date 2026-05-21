# Verification — Change 006 — is_active Toggle para Ingredientes y Categorías

**Estado:** ✅ Done
**Fecha:** 2026-05-12

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `ingredientes/models.py` | + `is_active: bool = True` |
| `categorias/models.py` | + `is_active: bool = True` |
| `ingredientes/schemas.py` | `IngredienteRead` + `is_active`, `deleted_at` |
| `categorias/schemas.py` | `CategoriaRead` + `is_active` |
| `ingredientes/service.py` | Refactorizado a clase, + `toggle_active()`, + `eliminar()` con `soft_delete()` |
| `categorias/service.py` | + `toggle_active()` |
| `ingredientes/router.py` | Refactorizado (sin UoW en router), + `PATCH /{id}/toggle-active` |
| `categorias/router.py` | + `PATCH /{id}/toggle-active` |

## Semántica final completa (todos los módulos)

| Módulo | ⏸ Inhabilitar | 🗑️ Archivar | Campo "pausa" |
|---|---|---|---|
| Ingredientes | `PATCH /{id}/toggle-active` | `DELETE /{id}` | `is_active` |
| Categorías | `PATCH /{id}/toggle-active` | `DELETE /{id}` | `is_active` |
| Usuarios | `PATCH /{id}/toggle-active` | `DELETE /{id}` | `is_active` |
| Productos | `PATCH /{id}` (`disponible`) | `DELETE /{id}` | `disponible` |

## Nota para el equipo frontend
El frontend puede usar los siguientes campos de la respuesta para mostrar etiquetas:
- `is_active = false` → 🟡 etiqueta "Inactivo"
- `deleted_at != null` → 🔴 etiqueta "Archivado" (solo visible con `include_deleted=true`)
- Ambos en `null/true` → estado normal, sin etiqueta
