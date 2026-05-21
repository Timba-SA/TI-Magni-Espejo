# Checklist de Implementación: UnidadMedida y Catálogo de Productos

Este archivo detalla el plan de acción táctico paso a paso para completar el requerimiento de unidades de medida en el backend.

## Fase 1: Pruebas Automatizadas (Strict TDD Mode)
- [x] Crear tests de integración para el CRUD de `UnidadMedida` (`tests/test_unidades_medida.py`).
- [x] Crear tests de integración para la creación de `Producto` vinculando `unidad_venta_id` válida e inválida.
- [x] Crear tests de integración para la asociación de `ProductoIngrediente` con `cantidad` y `unidad_medida_id`.

## Fase 2: Modelos de Base de Datos y Persistencia
- [x] Implementar la clase `UnidadMedida` en `backend/app/modules/productos/models.py`.
- [x] Actualizar la clase `Producto` en `backend/app/modules/productos/models.py` agregando `unidad_venta_id` y su relación.
- [x] Actualizar la clase `ProductoIngrediente` en `backend/app/modules/productos/models.py` agregando `cantidad`, `unidad_medida_id` y su relación.
- [x] Registrar el repositorio de `UnidadMedida` (`UnidadMedidaRepository`) en el Unit of Work.

## Fase 3: Capa de Negocio (Schemas, Services & Routers)
- [x] Definir los esquemas de Pydantic para `UnidadMedida` (`UnidadMedidaCreate`, `UnidadMedidaRead`, `UnidadMedidaUpdate`) en `backend/app/modules/productos/schemas.py`.
- [x] Actualizar los esquemas de `ProductoRead` e `ProductoIngredienteRead` para devolver la información de unidades de medida asociadas.
- [x] Implementar `UnidadMedidaService` en `backend/app/modules/productos/service.py` con las validaciones de negocio correspondientes.
- [x] Crear los endpoints CRUD de unidades de medida en `backend/app/modules/productos/router.py`.
- [x] Agregar endpoint `POST /productos/{id}/ingredientes` con validación de `cantidad` y `unidad_medida_id`.
- [x] Validar registro de rutas en `backend/main.py` (sin cambios necesarios).

## Fase 4: Semilla de Datos y Verificación final
- [x] Agregar la seed de unidades de medida básicas en `backend/app/db/seed.py`.
- [x] Ejecutar la suite completa de pruebas de backend con `pytest` para confirmar que todas las validaciones pasen satisfactoriamente.
