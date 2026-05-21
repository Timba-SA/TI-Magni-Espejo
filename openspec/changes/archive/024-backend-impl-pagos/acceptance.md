# Criterios de Aceptación: Backend - Integración con MercadoPago (Idempotency y Webhook)

Este documento detalla las condiciones de validación y escenarios de negocio que la implementación del módulo de pagos debe satisfacer para ser dada por completada.

---

### Escenario 1: Inicio de Pago Exitoso (Creación de Preferencia)
- **Dado** que un usuario autenticado tiene un pedido en estado `PENDIENTE`.
- **Cuando** realiza una petición `POST /api/v1/pagos/iniciar` enviando `{pedido_id: X}`.
- **Entonces** el sistema debe:
  - Generar de forma asíncrona la preferencia en MercadoPago consumiendo la API asíncronamente con `httpx`.
  - Crear un registro en la tabla `pagos` con estado inicial `pending`, la clave de idempotencia generada, el `external_reference` (`pedido_X`), y el monto total calculado.
  - Retornar un `200 OK` o `201 Created` con el `preference_id` y el `init_point` (URL de checkout).

---

### Escenario 2: Idempotencia en Inicio de Pago
- **Dado** que un pedido ya posee un intento de pago activo (`pending`) en la base de datos.
- **Cuando** el cliente realiza una segunda petición consecutiva `POST /api/v1/pagos/iniciar` para el mismo `pedido_id`.
- **Entonces** el sistema no debe llamar a la API externa de MercadoPago ni crear un nuevo registro redundante; en su lugar, debe retornar inmediatamente el `preference_id` y el `init_point` guardados en el registro pendiente existente de forma instantánea.

---

### Escenario 3: Procesamiento Exitoso de Webhook de Aprobación
- **Dado** que un pedido en estado `PENDIENTE` posee un registro de pago asociado en estado `pending`.
- **Cuando** se recibe una petición HTTP `POST /api/v1/pagos/webhook` con una firma digital válida (`X-Signature`) y MercadoPago reporta que el estado de la transacción es `approved`.
- **Entonces** el sistema debe:
  - Actualizar el estado del registro `Pago` a `approved` en la base de datos.
  - Avanzar de forma atómica el estado del `Pedido` a `CONFIRMADO` en el historial (None -> PENDIENTE -> CONFIRMADO).
  - Confirmar todos los cambios transaccionalmente mediante UoW.
  - Responder rápidamente con un status `200 OK` y JSON `{ "status": "ok" }`.

---

### Escenario 4: Procesamiento de Webhook con Pago Rechazado
- **Dado** que un pedido en estado `PENDIENTE` posee un registro de pago asociado en estado `pending`.
- **Cuando** se recibe un webhook de notificación indicando que el pago ha sido rechazado (`rejected`).
- **Entonces** el sistema debe:
  - Actualizar el estado del registro `Pago` a `rejected` en la base de datos.
  - Mantener el estado del `Pedido` intacto en `PENDIENTE` (lo que le permitirá al cliente reintentar el pago o cancelarlo formalmente).
  - Responder exitosamente con un status `200 OK` y JSON `{ "status": "ok" }`.

---

### Escenario 5: Webhook con Firma Digital Inválida
- **Dado** que se recibe una notificación en el endpoint `/api/v1/pagos/webhook`.
- **Cuando** el header `X-Signature` no coincide con el HMAC calculado o está ausente (y la validación está activa en configuración).
- **Entonces** la API debe responder inmediatamente con un código `401 Unauthorized` o `403 Forbidden` y no alterar ningún estado en la base de datos.

---

### Escenario 6: Rechazo por Pedido Ajeno o Inexistente
- **Dado** que un usuario intenta iniciar el pago de un pedido.
- **Cuando** el `pedido_id` no existe en el sistema o pertenece a otro usuario diferente al autenticado.
- **Entonces** el sistema debe denegar el acceso retornando un código de error HTTP apropiado (`404 Not Found` o `403 Forbidden`).
