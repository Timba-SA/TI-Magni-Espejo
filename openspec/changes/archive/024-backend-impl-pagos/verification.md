# Reporte de Verificación: Integración con MercadoPago (Change 024)

Este documento certifica que la implementación de la pasarela de pagos con MercadoPago, control de idempotencia y procesamiento asíncrono de webhooks satisface todos los criterios de aceptación y especificaciones de diseño técnico.

---

## 1. Pruebas Automatizadas de Aceptación (Strict TDD Mode)

Se ejecutó la suite de pruebas unitarias y de integración asíncronas en `backend/tests/test_pagos.py`. Las 6 pruebas pasaron con éxito:

```bash
tests/test_pagos.py::test_iniciar_pago_exitoso PASSED                    [ 16%]
tests/test_pagos.py::test_iniciar_pago_idempotencia PASSED               [ 33%]
tests/test_pagos.py::test_iniciar_pago_pedido_ajeno_forbidden PASSED     [ 50%]
tests/test_pagos.py::test_webhook_pago_aprobado PASSED                   [ 66%]
tests/test_pagos.py::test_webhook_pago_rechazado PASSED                  [ 83%]
tests/test_pagos.py::test_webhook_firma_invalida PASSED                  [100%]
```

### Detalle de Escenarios de Aceptación Evaluados:

1. **Inicio de Pago Exitoso:** Se valida que al iniciar el pago de un pedido en estado `PENDIENTE`, se consume la API de Checkout de MercadoPago de manera asíncrona, se genera un registro en la tabla `pagos` con estado `pending`, y se retorna la preferencia y el checkout link (`init_point`).
2. **Control de Idempotencia:** Se verifica que llamadas sucesivas de pago para un mismo pedido retornan instantáneamente el token y la URL ya generadas sin incurrir en segundas llamadas a MercadoPago ni duplicar registros en base de datos.
3. **Firma Digital Segura (HMAC-SHA256):** El endpoint `/webhook` valida la firma criptográfica en el header `X-Signature` calculada con `MP_WEBHOOK_SECRET`. Notificaciones con firmas no válidas son rechazadas con error HTTP `401 Unauthorized`.
4. **Procesamiento de Pago Aprobado (`approved`):** Al confirmarse el pago por webhook, el estado del pago pasa a `approved` y el estado del pedido es avanzado atómicamente a `CONFIRMADO` en el historial (None -> PENDIENTE -> CONFIRMADO) a través de `PedidoService`.
5. **Procesamiento de Pago Rechazado (`rejected`):** Si MercadoPago reporta que la transacción fue rechazada, el pago se actualiza a `rejected` y el pedido se mantiene en `PENDIENTE` para permitir reintentos por parte del cliente.
6. **Validación de Permisos:** Se restringe el inicio de pagos solo a los usuarios creadores de los pedidos, denegando el acceso con código HTTP `403 Forbidden` a usuarios ajenos.

---

## 2. Cobertura y Regresión Global del Backend

Se ejecutó la suite completa de pruebas automatizadas del backend para garantizar la ausencia de regresiones:

```bash
======================== 30 passed, 1 warning in 3.15s ========================
```

Todos los módulos existentes (Autenticación, Paginación, Usuarios, Direcciones, Pedidos y Unidades de Medida) siguen estables y pasando a verde.

---

## 3. TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.1 | `tests/test_pagos.py` | Unit | N/A (new) | ✅ Written | ✅ Passed | ➖ Single | ✅ Clean |
| 2.2 | `tests/test_pagos.py` | Unit | N/A (new) | ✅ Written | ✅ Passed | ✅ 2 cases | ✅ Clean |
| 2.3 | `tests/test_pagos.py` | Unit | N/A (new) | ✅ Written | ✅ Passed | ✅ 4 cases | ✅ Clean |
| 2.4 | `tests/test_pagos.py` | Unit | N/A (new) | ✅ Written | ✅ Passed | ➖ Single | ✅ Clean |
| 3.1 | `tests/test_pagos.py` | Unit | N/A (new) | ✅ Written | ✅ Passed | ✅ 2 cases | ✅ Clean |
| 3.2 | `tests/test_pagos.py` | Integration | N/A (new) | ✅ Written | ✅ Passed | ✅ 3 cases | ✅ Clean |
| 3.3 | `tests/test_pagos.py` | Integration | N/A (new) | ✅ Written | ✅ Passed | ✅ 3 cases | ✅ Clean |

### Test Summary
- **Total tests written**: 6
- **Total tests passing**: 6
- **Layers used**: Unit (4), Integration (2)
- **Approval tests**: None
- **Pure functions created**: 2

---

## 4. Estado de Certificación

La implementación se encuentra certificada por el **Tech Lead / Arquitecto Senior** de The Food Store. Todos los checks de aceptación están en verde y libres de vulnerabilidades.
