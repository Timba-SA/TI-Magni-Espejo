# Criterios de Aceptación (Acceptance Criteria)
**ID del Cambio:** 025-backend-impl-admin-stock
**Contexto:** Gestión de Stock y Disponibilidad de Productos (Backend)

---

Los siguientes escenarios y condiciones deben cumplirse estrictamente para dar el cambio como aprobado e implementado con éxito:

## Criterios Clave

### Escenario 1: Operador Autorizado actualiza existencias y disponibilidad con éxito
* **Dado** que un usuario autenticado posee el rol `ADMIN` o `STOCK`,
* **Cuando** realiza una petición `PATCH /api/v1/productos/{id}/disponibilidad` enviando un payload con `{"stock_cantidad": 20, "disponible": false}`,
* **Entonces** la API responde con `200 OK` retornando el objeto `Producto` reflejando los nuevos valores,
* **Y** en la base de datos se comprueba que el producto tiene efectivamente `20` unidades y `disponible=False` con el campo `updated_at` actualizado al timestamp actual.

### Escenario 2: Restricción de permisos para clientes y usuarios generales (RBAC)
* **Dado** que un usuario autenticado posee el rol `CLIENT` (o no está autenticado),
* **Cuando** intenta realizar una petición `PATCH /api/v1/productos/{id}/disponibilidad`,
* **Entonces** la API responde con `403 Forbidden` (o `401 Unauthorized` si no hay token),
* **Y** se verifica que los valores de stock y disponibilidad del producto en la base de datos no sufrieron ninguna alteración.

### Escenario 3: Validación de entrada de datos (Reglas de Negocio)
* **Dado** que un usuario autenticado posee los permisos adecuados (`ADMIN` o `STOCK`),
* **Cuando** envía un payload con un valor negativo en el stock (`{"stock_cantidad": -5}`),
* **Entonces** la API responde con `422 Unprocessable Entity` (o `400 Bad Request` según la validación de Pydantic/FSM),
* **Y** los datos en el inventario de la base de datos permanecen intactos.

### Escenario 4: Intentar actualizar un producto inexistente
* **Dado** un operador con rol `STOCK` o `ADMIN`,
* **Cuando** realiza la petición con un ID de producto que no existe en el catálogo o que está marcado con `deleted_at is not None`,
* **Entonces** la API responde con `404 Not Found`.
