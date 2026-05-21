# Tasks — Change 006 — is_active Toggle para Ingredientes y Categorías

## Modelos
- [x] `ingredientes/models.py` → añadir `is_active: bool = Field(default=True, nullable=False)`
- [x] `categorias/models.py` → añadir `is_active: bool = Field(default=True, nullable=False)`

## Schemas
- [x] `ingredientes/schemas.py` → añadir `is_active: bool` y `deleted_at` a `IngredienteRead`
- [x] `categorias/schemas.py` → añadir `is_active: bool` a `CategoriaRead`

## Services
- [x] `ingredientes/service.py` → refactorizado a clase con `__init__(session)`
- [x] `ingredientes/service.py` → nuevo método `toggle_active(id)`
- [x] `ingredientes/service.py` → `eliminar()` usa `soft_delete()` (ya lo hacía, mantenido)
- [x] `categorias/service.py` → nuevo método `toggle_active(id)`

## Routers
- [x] `ingredientes/router.py` → refactorizado (instancia `IngredienteService(session)`, sin UoW en router)
- [x] `ingredientes/router.py` → nuevo endpoint `PATCH /{id}/toggle-active`
- [x] `categorias/router.py` → nuevo endpoint `PATCH /{id}/toggle-active`
