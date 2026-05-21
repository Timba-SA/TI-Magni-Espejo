# Criterios de Aceptación: Backend - Direcciones de Entrega

Este documento define las condiciones y escenarios específicos que deben validarse para considerar finalizado e implementado correctamente el requerimiento de direcciones de entrega en The Food Store.

---

## Escenarios de Aceptación

### Escenario 1: Creación de primera dirección de entrega
* **Dado** que un usuario autenticado no tiene ninguna dirección de entrega registrada.
* **Cuando** realiza una petición `POST /api/v1/direcciones/` con datos válidos de dirección.
* **Entonces** el sistema debe:
  1. Registrar la dirección asignándola al `usuario_id` del usuario autenticado.
  2. Asignar automáticamente `es_principal = True` (al ser su primera dirección).
  3. Retornar los datos completos de la dirección con código de estado HTTP `200 OK` (o `201 Created`).

---

### Escenario 2: Alternancia transaccional de dirección principal
* **Dado** que un usuario autenticado posee múltiples direcciones de entrega registradas, y la dirección con `ID: A` está marcada como principal (`es_principal = True`).
* **Cuando** realiza una petición `PATCH /api/v1/direcciones/{ID: B}/principal` (donde B es otra dirección de su propiedad).
* **Entonces** el sistema debe:
  1. Validar la pertenencia de la dirección B al usuario.
  2. Desmarcar la dirección A como principal (`es_principal = False`).
  3. Marcar la dirección B como principal (`es_principal = True`).
  4. Realizar todo el proceso dentro de una única transacción atómica de base de datos.
  5. Retornar la información actualizada de la dirección B con código HTTP `200 OK`.

---

### Escenario 3: Modificación y validación de propiedad (Ownership)
* **Dado** que el `Usuario 1` posee la dirección con `ID: X` y el `Usuario 2` posee la dirección con `ID: Y`.
* **Cuando** el `Usuario 1` intenta modificar la dirección `ID: Y` mediante un `PUT /api/v1/direcciones/Y` o cambiar su estado de principal con `PATCH /api/v1/direcciones/Y/principal`.
* **Entonces** el sistema debe:
  1. Denegar la operación.
  2. Retornar un error de seguridad HTTP `403 Forbidden` o `404 Not Found` (para no revelar existencia). En este sistema se prefiere `403 Forbidden` por ser explícito ante manipulación inválida de propiedad.

---

### Escenario 4: Soft Delete de dirección de entrega
* **Dado** que un usuario posee una dirección de entrega registrada.
* **Cuando** realiza una petición `DELETE /api/v1/direcciones/{id}` de su propiedad.
* **Entonces** el sistema debe:
  1. Validar propiedad.
  2. Asignar el timestamp actual en el campo `deleted_at`.
  3. Retornar un código de estado HTTP `204 No Content` (o `200 OK`).
  4. Excluir esta dirección en todas las peticiones `GET /api/v1/direcciones/` posteriores, pero mantener el registro físico en la base de datos para no alterar el historial relacional de pedidos antiguos.

---

### Escenario 5: Restricción de borrado para direcciones con pedidos activos
* **Dado** que una dirección de entrega posee pedidos activos asociados (esta validación será un placeholder mockeable hasta el Change `023`).
* **Cuando** el usuario intenta borrar la dirección mediante un `DELETE /api/v1/direcciones/{id}`.
* **Entonces** el sistema debe:
  1. Denegar la operación de borrado.
  2. Retornar un error HTTP `409 Conflict` detallando que la dirección tiene pedidos pendientes o activos en tránsito.
