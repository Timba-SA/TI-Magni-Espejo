# Criterios de Aceptación: UnidadMedida y Catálogo de Productos

Estos son los criterios formales y escenarios de prueba que deben cumplirse y validarse bajo el flujo de **Strict TDD Mode** antes de dar la tarea por finalizada.

## Criterios de Aceptación Funcionales

### 1. Gestión del Catálogo de Unidades de Medida (`UnidadMedida`)
*   **Creación de Unidad:** Un usuario administrador puede crear una unidad de medida especificando `nombre` (único, ej: "Kilogramo"), `simbolo` (único, ej: "kg") y `tipo` (debe ser uno de: `masa`, `volumen`, `unidad`, `area`).
*   **Restricciones de Unicidad:** La base de datos debe rechazar la creación de dos unidades con el mismo símbolo o el mismo nombre (falla controlada, HTTP 400 Bad Request en la API).
*   **Lectura de Unidades:** Cualquier usuario autenticado puede listar las unidades de medida habilitadas para mostrarlas en selectores en la UI de creación de productos.

### 2. Estandarización de Ventas del Producto
*   **Asociación Opcional:** Un producto puede ser creado/editado sin unidad de venta asociada (lo que significa venta por pieza/unidad por defecto).
*   **Asociación Obligatoria cuando se define:** Si se proporciona un `unidad_venta_id`, este debe validarse en el servicio. Si el ID no existe en la base de datos, el servicio debe levantar una excepción controlada (HTTP 422 o 400) en lugar de permitir que la base de datos arroje una violación de FK.
*   **Renderizado de Leyenda:** La API al devolver un producto (`ProductoRead`) con unidad de venta debe incluir su información (ej: `"unidad_venta": {"simbolo": "kg"}`).

### 3. Receta Precisa de Ingredientes en el Producto
*   **Campos Requeridos:** Al asociar un ingrediente a un producto (`ProductoIngrediente`), es **obligatorio** especificar la `cantidad` (debe ser mayor a 0, ej: `0.150` kg) y la `unidad_medida_id`.
*   **Validación de Existencia:** La `unidad_medida_id` proporcionada debe existir en la base de datos.
*   **Compatibilidad Física (Opcional - Fase Futura):** Para evitar registrar cosas absurdas como "0.500 litros de queso rallado", en el futuro se implementará un validador de tipos de unidad, pero por ahora solo se requiere validación de existencia en la base de datos.

---

## Escenarios de Pruebas Automatizadas (TDD)

### Escenario 1: Creación de unidad de medida duplicada
*   **Dado** que existe una unidad con símbolo `"kg"`,
*   **Cuando** se intenta crear otra unidad con símbolo `"kg"`,
*   **Entonces** la API debe responder con un error `400 Bad Request` indicando que el símbolo ya está en uso, y la base de datos no debe duplicar la fila.

### Escenario 2: Creación de producto con unidad de venta inexistente
*   **Dado** que el ID `999` no corresponde a ninguna unidad de medida registrada,
*   **Cuando** se intenta crear un producto con `unidad_venta_id = 999`,
*   **Entonces** el servicio de productos debe lanzar un error `400 / 422` de validación y la transacción debe hacer rollback completo.

### Escenario 3: Asociación de ingrediente con porción incorrecta
*   **Dado** un ingrediente registrado,
*   **Cuando** se asocia al producto con `cantidad = -0.50` o `cantidad = 0.00`,
*   **Entonces** el validador del esquema de Pydantic o del servicio de base de datos debe lanzar un error de validación e impedir la inserción.
