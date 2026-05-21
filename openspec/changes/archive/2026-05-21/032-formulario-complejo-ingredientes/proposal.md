# Proposal: Formulario Complejo y Gestión de Stock de Ingredientes (032-formulario-complejo-ingredientes)

Este change propone enriquecer y sofisticar la gestión de Ingredientes (Insumos) en **The Food Store**. En lugar de un formulario simple con solo Nombre y Descripción, añadiremos soporte para:
1. **Unidades de Medida**: Asociación de cada ingrediente con su unidad física (kg, g, L, mL, u, etc.).
2. **Control de Inventario**: Campos de `stock_actual`, `stock_minimo` (para alertas de stock bajo) y `costo_unitario` para estimación de costos y valor total.
3. **Interfaz de Usuario Premium**: Un formulario rediseñado en dos columnas/secciones translúcidas, validación de números decimales, dropdown dinámico de unidades de medida, y alertas visuales en la tabla cuando el stock es menor al mínimo.

---

## Contexto y Alcance
Actualmente, el formulario de creación de ingredientes es básico (Nombre, Descripción, Es Alérgeno). Sin embargo, en el backend ya existe una tabla de `unidades_medida` utilizada para definir las porciones de recetas en los productos.

Al unificar los ingredientes con unidades de medida, stock y costos en el backend, habilitamos:
- Control de inventario real a nivel de insumos.
- Alertas de reabastecimiento (cuando `stock_actual <= stock_minimo`).
- Valorización económica del stock actual.
- Cero mocks: integración directa con la base de datos real.

---

## Cambios Propuestos

### 1. Backend (FastAPI + SQLModel)
* **Modelos (`backend/app/modules/ingredientes/models.py`)**:
  - Agregar `unidad_medida_id: Optional[int] = Field(default=None, foreign_key="unidades_medida.id", nullable=True)`
  - Agregar `stock_actual: Decimal = Field(default=0.000, decimal_places=3, max_digits=10)`
  - Agregar `stock_minimo: Decimal = Field(default=0.000, decimal_places=3, max_digits=10)`
  - Agregar `costo_unitario: Decimal = Field(default=0.00, decimal_places=2, max_digits=10)`
  - Relación `unidad_medida: Optional[UnidadMedida] = Relationship()`
* **Esquemas (`backend/app/modules/ingredientes/schemas.py`)**:
  - Incluir los campos en `IngredienteCreate`, `IngredienteUpdate` e `IngredienteRead`.
* **Servicios (`backend/app/modules/ingredientes/service.py`)**:
  - Cargar mediante `relationship` o `selectinload` la unidad de medida correspondiente al listar u obtener ingredientes para que el frontend disponga de ella (ej. `ingrediente.unidad_medida.simbolo`).
* **Migración en SQLite**:
  - Crear una migración manual al arrancar el backend que corra consultas `ALTER TABLE` si no existen las columnas, protegiendo las filas reales.

### 2. Frontend (React + TypeScript)
* **Tipos (`frontend/src/features/insumos/types/insumo.types.ts`)**:
  - Expandir las interfaces `Ingrediente` e `IngredienteFormData` con `unidad_medida_id`, `stock_actual`, `stock_minimo`, `costo_unitario` y el objeto opcional `unidad_medida`.
* **Servicios (`frontend/src/features/insumos/services/insumosService.ts`)**:
  - Modificar las llamadas a la API en `createInsumo` y `updateInsumo` para serializar los campos correctamente como números flotantes.
* **Componente Formulario (`InsumoForm.tsx`)**:
  - Rediseñar el modal para albergar dos secciones:
    - **Información Básica** (Nombre, Descripción, Alérgeno).
    - **Control de Inventario & Medida** (Dropdown de Unidades de Medida consumido de la API, Costo Unitario, Stock Actual, Stock Mínimo).
  - Usar animaciones translúcidas premium.
* **Tabla de Insumos (`InsumosTable.tsx`)**:
  - Mostrar el stock con su símbolo (ej: `150.00 kg`).
  - Mostrar el costo unitario formateado (ej: `$1,200.00 / kg`).
  - Colorear el stock en amarillo/naranja con una etiqueta de aviso de "Stock Crítico" cuando esté por debajo del límite mínimo.
* **Estadísticas de Inventario (`InsumoStats.tsx`)**:
  - Calcular el valor económico del stock total.
  - Mostrar la cantidad total de ingredientes críticos de forma reactiva.

---

## Plan de Verificación

### Pruebas Automatizadas (Backend)
- Crear `backend/tests/test_ingredientes_inventario.py` para asegurar que el CRUD de ingredientes valide la existencia de `unidad_medida_id`, cantidades decimales positivas y la correcta recuperación.

### Pruebas Manuales (Frontend)
- Abrir el modal "Nuevo ingrediente" y verificar que cargue las unidades físicas reales del backend.
- Crear un ingrediente con stock crítico y validar el color de alerta en la tabla.
- Verificar que el valor total del inventario en las tarjetas cambie dinámicamente.
