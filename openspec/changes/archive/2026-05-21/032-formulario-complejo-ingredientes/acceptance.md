# Acceptance Criteria: Formulario Complejo y Gestión de Stock de Ingredientes (032-formulario-complejo-ingredientes)

Este documento define las condiciones exactas y los escenarios que deben cumplirse para dar por completada la implementación de la gestión de stock y formulario de ingredientes.

---

## 1. Escenarios de Aceptación (Backend)

### Escenario 1: Creación Exitosa de Ingrediente con Inventario Completo
* **Dado** un usuario administrador autenticado.
* **Cuando** realiza un `POST /api/v1/ingredientes` con:
  - `nombre: "Sal Fina"`
  - `unidad_medida_id: 2` (Gramos)
  - `stock_actual: 5000.000`
  - `stock_minimo: 1000.000`
  - `costo_unitario: 0.15`
* **Entonces** el servidor debe responder con `200 OK` y persistir todos los valores en la base de datos de manera exacta, retornando además el objeto de la unidad de medida en la respuesta.

### Escenario 2: Listar Ingredientes Precargando la Unidad de Medida
* **Dado** que existen ingredientes en el sistema enlazados a sus unidades de medida correspondientes.
* **Cuando** el cliente realiza un `GET /api/v1/ingredientes`.
* **Entonces** la respuesta debe incluir para cada ítem el objeto `unidad_medida` completo (con su `simbolo`, `nombre` y `tipo`) para evitar llamadas adicionales o mocks.

---

## 2. Escenarios de Aceptación (Frontend)

### Escenario 3: Interfaz Translúcida del Formulario de Ingredientes
* **Dado** el panel administrativo en la sección de Gestión de Inventario.
* **Cuando** el usuario hace clic en el botón "+ Nuevo" ingrediente.
* **Entonces** el modal debe desplegarse con un diseño premium de dos columnas translúcidas:
  - Columna 1: Nombre, Descripción y Checkbox de Alérgeno.
  - Columna 2: Selector dinámico de Unidad de Medida, Costo Unitario, Stock Actual y Stock Mínimo.
* **Y** la lista de unidades de medida debe cargarse en tiempo real llamando a la API.

### Escenario 4: Alertas de Stock Crítico y Valorización de Inventario
* **Dado** un ingrediente cuyo `stock_actual` sea menor o igual a su `stock_minimo` (y `stock_minimo > 0`).
* **Cuando** el administrador visualiza la tabla de ingredientes.
* **Entonces** se debe destacar visualmente con un badge estilizado color ámbar/rojo indicando "Stock Crítico" y pintar la celda del stock de forma llamativa.
* **Y** las tarjetas de estadísticas superiores deben reflejar el costo económico total de todo el stock acumulado (`stock_actual * costo_unitario`).

---

## 3. Criterios de Aceptación Técnicos (Estáticos)
- [ ] **TypeScript Limpio**: Ejecutar `npx tsc --noEmit` en el frontend y validar cero errores de tipado o variables no declaradas.
- [ ] **Pruebas Completas**: Las pruebas del backend para ingredientes e inventario deben pasar al 100% sin mocks.
- [ ] **Migración Segura**: El sistema debe arrancar con los nuevos campos agregados automáticamente a la base de datos sqlite real, sin forzar la pérdida de los datos actuales de prueba.
