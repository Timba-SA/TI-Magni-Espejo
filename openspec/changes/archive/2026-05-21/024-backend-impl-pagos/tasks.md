# Checklist de Implementación: Backend - Integración con MercadoPago (Change 024)

Este documento organiza los pasos técnicos requeridos para implementar el flujo transaccional asíncrono e idempotente de cobro con MercadoPago.

---

## Fase 1: Pruebas Automatizadas (Strict TDD Mode)
- [x] Crear el archivo de pruebas asíncronas/síncronas `backend/tests/test_pagos.py`.
- [x] Implementar test: Inicio de pago satisfactorio (crea preferencia simulada y registro en DB con status `pending`).
- [x] Implementar test: Idempotencia en inicio de pago (mismo pedido devuelve la misma preferencia sin duplicados).
- [x] Implementar test: Webhook de pago aprobado (`approved`) avanza pedido a `CONFIRMADO` y actualiza pago en DB.
- [x] Implementar test: Webhook de pago rechazado (`rejected`) mantiene el pedido en `PENDIENTE` y actualiza pago en DB.
- [x] Implementar test: Rechazo de webhook con firma digital `X-Signature` incorrecta.
- [x] Implementar test: Inicio de pago sobre pedido ajeno o inexistente (debe dar `403 Forbidden` / `404 Not Found`).

---

## Fase 2: Modelado e Infraestructura de DB
- [x] Configurar variables de entorno `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` in `app/core/config.py` y `.env.example`.
- [x] Definir el modelo `Pago` en `backend/app/modules/pagos/models.py`.
- [x] Implementar los repositorios en `backend/app/modules/pagos/repository.py`:
  - `PagoRepository` con métodos `get_by_pedido`, `get_by_external_reference`, `get_by_idempotency_key` y `get_by_mp_payment_id`.
- [x] Implementar la clase `PagoUoW` en `backend/app/modules/pagos/unit_of_work.py` exponiendo `pagos`.

---

## Fase 3: Capa de Negocio (Schemas, Services & Routers)
- [x] Implementar los esquemas en `backend/app/modules/pagos/schemas.py`:
  - Requests: `IniciarPagoRequest`, `WebhookPayload`.
  - Responses: `PagoResponse`, `PreferenceResponse`.
- [x] Implementar toda la lógica asíncrona en `PagoService` (`backend/app/modules/pagos/service.py`):
  - `iniciar_pago` con control de idempotencia y llamadas `httpx.AsyncClient`.
  - `procesar_webhook` con algoritmo de validación de firma digital `X-Signature`, recuperación de estado mediante `httpx.AsyncClient` y avance atómico de estados llamando a `PedidoService.avanzar_estado`.
- [x] Implementar los endpoints HTTP en `backend/app/modules/pagos/router.py`.
- [x] Registrar el router de pagos en `backend/main.py`.

---

## Fase 4: Verificación Final
- [x] Ejecutar la suite de pruebas local (`pytest tests/test_pagos.py -v`) hasta lograr que todo pase a verde.
- [x] Ejecutar el total de la suite de pruebas del backend (`pytest`) para asegurar cero regresiones.
- [x] Registrar los cambios en `changes.md` y redactar `verification.md` de la versión.
- [x] Integrar (mergear) directamente a la rama `master` y realizar push origin master.
