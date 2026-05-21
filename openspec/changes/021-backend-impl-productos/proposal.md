# Proposal: Backend: Implementación de UnidadMedida y Actualización de Catálogo de Productos

## Contexto y Problema
Actualmente, el sistema de catálogo de *The Food Store* maneja los productos con un `precio_base` simple, pero carece de una noción formal de **Unidad de Medida**. Esto provoca los siguientes problemas de diseño técnico:
1. **Ambigüedad en precios:** No se puede diferenciar si un precio base de $12.50 corresponde a "un kilogramo", "un litro" o "una pieza / unidad".
2. **Falta de precisión en ingredientes:** La relación intermedia `ProductoIngrediente` define si un ingrediente es removible, pero no estandariza la cantidad o la unidad de medida que se requiere para la receta del producto en el backend (por ejemplo, "150 gramos de queso").
3. **Escalabilidad limitada:** Sin unidades de medida tipadas y categorizadas, es imposible realizar auditorías automatizadas de inventario, conversiones automáticas de stock o integraciones robustas de trazabilidad en el futuro.

## Solución Propuesta
Proponemos implementar la entidad **`UnidadMedida`** y actualizar el modelo relacional del catálogo de productos según el diseño del ERD v6:
1. **Crear la entidad `UnidadMedida`:** Como una tabla de catálogo para estandarizar las unidades físicas (`kg`, `g`, `L`, `mL`, `u`, `doc`, `m²`).
2. **Actualizar el modelo `Producto`:** Incorporar el campo `unidad_venta_id` (FK apuntando a `UnidadMedida.id`, opcional) para clarificar cómo se comercializa el producto.
3. **Actualizar el modelo `ProductoIngrediente`:** Incorporar los campos `cantidad` (`DECIMAL(10,3)`) y `unidad_medida_id` (FK apuntando a `UnidadMedida.id`, requerido) para estandarizar la receta.
4. **Seed de datos iniciales:** Proveer las unidades de medida básicas en el script de seed (`app/db/seed.py`).

## Trade-offs e Implicaciones
*   **Ventajas:**
    *   **Claridad de negocio:** Permite renderizar en el frontend leyendas precisas como "S/. 12.50 / kg" o "S/. 3.00 / u".
    *   **Integridad del Modelo:** Los ingredientes quedan perfectamente dimensionados para recetas del mundo real.
    *   **Futuro seguro:** Sienta las bases definitivas para el control de inventario/stock e insumos.
*   **Riesgos / Mitigaciones:**
    *   *Migraciones de DB:* Al agregar claves foráneas a tablas existentes (`productos` y `producto_ingredientes`), debemos asegurarnos de que sean nulables o tengan valores por defecto seguros en la base de datos de desarrollo actual (SQLite). Dado que estamos usando `create_db_and_tables()` en el ciclo de lifespan para desarrollo, regeneraremos la base de datos de forma segura.

---
## Aprobación Requerida
Esta propuesta sienta el cimiento de persistencia física e integridad de datos del catálogo de productos de *The Food Store*.
