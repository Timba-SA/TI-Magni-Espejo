# Tareas: Reestructuración de Stock, Peso y Gestión de Inactivos para Ingredientes

Este documento detalla el plan de trabajo secuencial para implementar y verificar el cambio.

## Fase 1: Infraestructura y Base de Datos
- [x] Modificar el modelo `Ingrediente` en [models.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/models.py) para agregar el campo `peso`.
- [x] Modificar `migrate_ingredientes_columns()` en [database.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/core/database.py) para crear la columna `peso` en la base de datos si no existe.

## Fase 2: Backend (Strict TDD Mode)
- [x] Crear tests de integración en [test_ingredientes_inventario.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/tests/test_ingredientes_inventario.py) que validen:
  - Creación y actualización de ingredientes con el campo `peso`.
  - Que al cambiar a inactivo, `deleted_at` tenga la fecha actual y `is_active` sea `False`.
  - Que al reactivar, `deleted_at` vuelva a `None`.
  - Que el listado por defecto filtre los inactivos y con `incluir_inactivos=True` los traiga.
- [ ] Agregar tests específicos para el endpoint `DELETE` que verifiquen que pone `is_active = False` además de `deleted_at != None` (soft delete) y que desaparece del listado por defecto.
- [x] Implementar cambios en Pydantic schemas en [schemas.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/schemas.py).
- [ ] Modificar repositorio de ingredientes en [repository.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/repository.py) para que filtre inactivos y eliminados lógicos por defecto (`is_active == True` y `deleted_at == None`).
- [ ] Modificar servicio de ingredientes en [service.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/service.py) en la función `eliminar()` para setear `obj.is_active = False`.
- [x] Modificar rutas en [router.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/router.py) para recibir el query param `incluir_inactivos`.
- [x] Modificar la función `exportar` en [service.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/service.py) para exportar peso y estado.
- [ ] Ejecutar la suite de pruebas del backend y asegurar que pasen en su totalidad.

## Fase 3: Frontend
- [x] Actualizar tipos de ingredientes en [insumo.types.ts](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/types/insumo.types.ts) (`peso`, `mostrarInactivos`).
- [x] Actualizar el cliente API en [insumosService.ts](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/services/insumosService.ts) para enviar `mostrar_inactivos` y `peso`.
- [x] Modificar [InsumoFilters.tsx](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/components/InsumoFilters.tsx) para añadir el toggle de "Mostrar inactivos".
- [ ] Modificar [InsumosTable.tsx](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/components/InsumosTable.tsx):
  - [x] Cambiar unidad de stock a `u`.
  - [ ] Ajustar formato de columna **Peso** con 1 decimal (`.toFixed(1)`).
  - [ ] Ajustar formato de **Stock Actual** sin decimales fijos (ej: `5` en lugar de `5.000` si es entero).
  - [x] Cambiar visualización de Costo Unitario a `/ u`.
  - [ ] Aplicar opacidad reducida (`opacity-60`) y etiqueta inactivo a filas correspondientes basándose en `is_active === false` o `deleted_at !== null`.
  - [x] Asegurar que el botón de eliminar solo llama a `onDelete` (soft delete) y que no existe botón de borrado definitivo.
- [x] Modificar [InsumoForm.tsx](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/components/InsumoForm.tsx) para incluir el campo numérico de **Peso** con la unidad dinámica.
- [ ] Modificar [InsumoDetailModal.tsx](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/components/InsumoDetailModal.tsx):
  - [ ] Ajustar formato de stock, stock mínimo y peso para eliminar ceros decimales innecesarios (peso a `.toFixed(1)` y stock sin decimales fijos).
  - [x] Mostrar la fecha de desactivación en caso de que esté inactivo.
- [x] Modificar [InsumosPage.tsx](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/pages/insumos/InsumosPage.tsx) para integrar el estado de filtros y controlar los modales.

## Fase 4: Limpieza de Base de Datos y Verificación Final
- [ ] Identificar y eliminar los ingredientes innecesarios de la base de datos de desarrollo mediante script/consulta en Docker.
- [ ] Verificar el correcto funcionamiento manual de todo el flujo en el frontend.
- [ ] Exportar a Excel y verificar que las columnas y datos coincidan con los criterios de aceptación.

