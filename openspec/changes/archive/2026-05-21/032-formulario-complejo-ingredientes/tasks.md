# Tasks: Formulario Complejo y Gestión de Stock de Ingredientes (032-formulario-complejo-ingredientes)

Este checklist detalla los pasos mecánicos para completar la implementación del formulario complejo de ingredientes y control de inventario físico.

---

## Fase 1: Infraestructura & Backend

- [ ] **1.1. Modificación de Modelos de Base de Datos**
  - [ ] Agregar los campos `unidad_medida_id`, `stock_actual`, `stock_minimo`, `costo_unitario` y la relación `unidad_medida` en `backend/app/modules/ingredientes/models.py`.
- [ ] **1.2. Actualización de Esquemas Pydantic**
  - [ ] Agregar validaciones de Decimal y opcionales en `backend/app/modules/ingredientes/schemas.py` para `IngredienteCreate`, `IngredienteUpdate` e `IngredienteRead`.
- [ ] **1.3. Ajuste de Servicios & Carga de Relaciones**
  - [ ] Refactorizar las consultas del repositorio en `backend/app/modules/ingredientes/service.py` para precargar `unidad_medida` usando `selectinload`.
  - [ ] Asegurar que las llamadas de creación y actualización guarden correctamente los nuevos campos decimales.
- [ ] **1.4. Script de Migración de Base de Datos Segura**
  - [ ] Crear un script o disparador que corra sentencias `ALTER TABLE` si las nuevas columnas no existen en `the_food_store.db`, evitando romper los datos reales.
- [ ] **1.5. Pruebas Automatizadas del Backend**
  - [ ] Implementar un test en `backend/tests/test_ingredientes_inventario.py` que valide el flujo completo del nuevo inventario y control de stock bajo.

---

## Fase 2: Frontend & Modelado

- [ ] **2.1. Actualización de Tipos de TypeScript**
  - [ ] Expandir la interfaz `Ingrediente` e `IngredienteFormData` en `frontend/src/features/insumos/types/insumo.types.ts`.
- [ ] **2.2. Integración de Servicios del Formulario**
  - [ ] Actualizar `insumosService.ts` para enviar los datos complejos de stock y costos.
  - [ ] Añadir una llamada para consumir el catálogo de unidades de medida (`GET /api/v1/unidades-medida/`).

---

## Fase 3: UI Premium & Componentes React

- [ ] **3.1. Rediseño del Formulario Premium (InsumoForm.tsx)**
  - [ ] Modificar el modal a un diseño translúcido de dos columnas/secciones en grid.
  - [ ] Integrar el dropdown reactivo para la selección de `unidad_medida_id`.
  - [ ] Implementar campos numéricos para `stock_actual`, `stock_minimo` y `costo_unitario` con validaciones de React Hook Form.
- [ ] **3.2. Refactorización de la Tabla de Insumos (InsumosTable.tsx)**
  - [ ] Formatear las columnas para mostrar el stock con su símbolo correspondiente (ej. `120.00 kg`).
  - [ ] Mostrar el costo unitario por medida (ej. `$450.00 / kg`).
  - [ ] Implementar la etiqueta/alerta visual "Stock Crítico" cuando el stock real caiga por debajo de la marca de stock mínimo.
- [ ] **3.3. Recalcular Tarjetas Estadísticas (InsumoStats.tsx)**
  - [ ] Mostrar el valor monetario total del inventario y la cantidad de insumos con stock crítico.
