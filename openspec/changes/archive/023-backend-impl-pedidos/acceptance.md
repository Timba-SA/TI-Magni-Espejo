# Criterios de Aceptación: Pedidos y Máquina de Estados (Change 023)

Este documento define las condiciones y escenarios de prueba que la implementación del Change `023` debe satisfacer para considerarse lista y verificada.

---

## Escenario 1: Creación Satisfactoria de un Pedido (Flujo Feliz)
**Dado** un usuario autenticado con el rol `CLIENT` que tiene una dirección de entrega activa y productos con stock suficiente en el menú,
**Cuando** envía una solicitud `POST /api/v1/pedidos/` con la lista de ítems, dirección de entrega y código de forma de pago habilitada,
**Entonces**:
1. El API responde con el código HTTP `200 OK` (o `201 Created`).
2. El pedido es guardado en estado `PENDIENTE`.
3. Se reduce de forma atómica la cantidad en stock (`stock_cantidad`) de los productos comprados.
4. Se registra una entrada de historial de estados con `estado_desde = NULL` y `estado_hacia = PENDIENTE`.
5. Los detalles del pedido capturan de forma exacta el nombre y precio del producto como snapshots.

---

## Escenario 2: Creación Fallida por Falta de Stock
**Dado** un cliente que intenta comprar una cantidad `Q` de un producto,
**Cuando** el producto correspondiente tiene un stock disponible menor a `Q`,
**Entonces**:
1. El API responde con el código HTTP `400 Bad Request`.
2. El cuerpo de la respuesta contiene un mensaje detallando que el stock es insuficiente.
3. No se crea ningún pedido en la base de datos (rollback completo de la transacción).
4. El stock de ningún producto es alterado.

---

## Escenario 3: Avance Exitoso de Estado de Pedido (FSM Admin)
**Dado** un usuario autenticado con el rol `ADMIN` o `PEDIDOS` y un pedido en estado `PENDIENTE`,
**Cuando** envía una solicitud `PATCH /api/v1/pedidos/{id}/estado` con `estado_hacia = "CONFIRMADO"`,
**Entonces**:
1. El API responde con `200 OK`.
2. El estado del pedido se actualiza a `CONFIRMADO`.
3. Se registra una entrada en el historial de estados de `PENDIENTE` a `CONFIRMADO`.

---

## Escenario 4: Transición de Estado Inválida (FSM Error)
**Dado** un pedido en estado `PENDIENTE`,
**Cuando** un administrador intenta cambiar su estado directamente a `EN_CAMINO` (saltándose `CONFIRMADO` y `EN_PREP`),
**Entonces**:
1. El API responde con el código HTTP `400 Bad Request`.
2. El estado del pedido no se modifica.
3. No se añade ninguna entrada al historial de estados.

---

## Escenario 5: Cancelación Permitida por el Cliente
**Dado** un cliente dueño de un pedido en estado `CONFIRMADO`,
**Cuando** envía una solicitud `PATCH /api/v1/pedidos/{id}/estado` con `estado_hacia = "CANCELADO"` y un motivo de cancelación no vacío,
**Entonces**:
1. El API responde con `200 OK`.
2. El estado del pedido se actualiza a `CANCELADO`.
3. Se registra en el historial el motivo de la cancelación.
4. Se devuelve automáticamente al stock del menú la cantidad de productos que formaban parte del pedido.

---

## Escenario 6: Cancelación Denegada al Cliente (Pedido en Cocina)
**Dado** un cliente dueño de un pedido en estado `EN_PREP` (en preparación),
**Cuando** envía una solicitud de cancelación,
**Entonces**:
1. El API responde con el código HTTP `403 Forbidden`.
2. El estado del pedido sigue siendo `EN_PREP`.
3. Se le notifica al cliente que no puede cancelar un pedido una vez iniciada la preparación.

---

## Escenario 7: Intento de Cancelación sin Motivo
**Dado** un administrador o cliente intentando cancelar un pedido,
**Cuando** envían la solicitud con el parámetro `motivo` ausente o vacío,
**Entonces**:
1. El API responde con el código HTTP `400 Bad Request`.
2. El estado del pedido no es modificado.
