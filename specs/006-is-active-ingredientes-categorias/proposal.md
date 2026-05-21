# Change 006 — is_active Toggle para Ingredientes y Categorías

**Estado:** Pendiente de aprobación
**Módulos afectados:** ingredientes, categorias
**Tipo:** Feature — Nuevo campo en modelo + endpoint de toggle

## Problema

El usuario reporta que desde la UI, al clickear el botón de eliminar (trash), el ítem desaparece permanentemente del panel de administración.

El problema tiene dos dimensiones:
1. **Ingredientes y Categorías no tienen `is_active`** — solo tienen `deleted_at` (soft delete). No hay forma de "pausar" un ítem sin archivarlo.
2. **El frontend muestra solo un botón de trash** — necesita un botón de pausa separado del botón de eliminar.

La semántica correcta que el usuario espera:

| Acción UI | Estado resultante | Visible en admin |
|---|---|---|
| 🗑️ Eliminar (trash) | `deleted_at = ahora` | NO (archivado) |
| ⏸ Inhabilitar | `is_active = false` | SÍ (con etiqueta "Inactivo") |
| ▶️ Habilitar | `is_active = true` | SÍ (etiqueta normal) |

## Alcance

- **Ingredientes**: añadir `is_active: bool = True` al modelo, endpoint `PATCH /{id}/toggle-active`, exponer en schema.
- **Categorías**: añadir `is_active: bool = True` al modelo, endpoint `PATCH /{id}/toggle-active`, exponer en schema.
- **Usuarios y Productos**: ya cuentan con esta funcionalidad — no se modifican.

> ⚠️ **Breaking change de BD:** Se añade una columna `is_active` a las tablas `ingredientes` y `categorias`. Si la BD ya tiene datos, SQLModel/Alembic necesita migración o recreación. Confirmar con el equipo si hay datos de producción.
