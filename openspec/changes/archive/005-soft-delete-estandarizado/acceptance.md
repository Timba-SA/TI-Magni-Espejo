# Acceptance Criteria — Change 005 — Soft Delete Estandarizado

## AC-1: Campos de estado en las respuestas
- Los endpoints de lectura de categorías, productos y usuarios devuelven el campo `deleted_at`.
- Los usuarios devuelven también `is_active`.

## AC-2: Filtrado por defecto
- `GET /categorias/`, `GET /productos/`, `GET /usuarios/` **no retornan** registros con `deleted_at != None` por defecto.

## AC-3: Inclusión opcional de archivados
- `GET /categorias/?include_deleted=true` retorna TODOS los registros.
- Ídem para productos y usuarios.

## AC-4: Soft Delete en Categorías y Productos
- `DELETE /categorias/{id}` retorna 204 y establece `deleted_at` (no borra físicamente).
- `DELETE /productos/{id}` retorna 204 y establece `deleted_at`.
- Un segundo `DELETE` sobre el mismo id retorna 404.

## AC-5: Soft Delete en Usuarios (nuevo endpoint)
- `DELETE /usuarios/{id}` retorna 204, establece `deleted_at`.
- Un admin no puede eliminarse a sí mismo → 400.
- Solo roles ADMIN pueden acceder → 403 para otros.

## AC-6: Semántica is_active vs deleted_at (Usuarios y Productos)
- `PATCH /usuarios/{id}/toggle-active` solo cambia `is_active`, el usuario sigue apareciendo en listas.
- `DELETE /usuarios/{id}` establece `deleted_at`, el usuario desaparece de las listas normales.
- Los schemas incluyen ambos campos para que el frontend pueda mostrar las etiquetas correctas.
