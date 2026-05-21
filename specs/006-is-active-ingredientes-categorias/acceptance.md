# Acceptance Criteria — Change 006

## AC-1: Campo is_active en modelos
- `ingredientes.is_active` existe en BD, default `true`.
- `categorias.is_active` existe en BD, default `true`.

## AC-2: Endpoints toggle-active
- `PATCH /ingredientes/{id}/toggle-active` → invierte `is_active`, retorna `IngredienteRead` con `is_active` actualizado.
- `PATCH /categorias/{id}/toggle-active` → invierte `is_active`, retorna `CategoriaRead` con `is_active` actualizado.
- Ambos retornan 404 si el id no existe o está archivado (`deleted_at != null`).

## AC-3: Schemas actualizados
- `IngredienteRead.is_active` presente.
- `CategoriaRead.is_active` presente.

## AC-4: Filtrado en listas
- `GET /ingredientes/` por defecto NO retorna ingredientes archivados (`deleted_at != null`).
- `GET /categorias/` por defecto NO retorna categorías archivadas.
- Ingredientes e items inactivos (`is_active=false`) SÍ aparecen en las listas del admin (con etiqueta visual en el frontend).

## AC-5: Patrón de arquitectura consistente
- `IngredienteService` sigue el patrón de clase con `__init__(session)` igual al resto de servicios.
- El router de ingredientes instancia `IngredienteService(session)` y no abre UoW directamente.
