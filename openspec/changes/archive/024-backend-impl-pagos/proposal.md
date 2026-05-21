# Change Proposal: Backend - Integración con MercadoPago (Idempotency y Webhook)

Este documento detalla la propuesta técnica para implementar la pasarela de pagos integrada de MercadoPago, garantizando un flujo transaccional seguro, asíncrono y robusto mediante idempotencia y procesamiento de notificaciones (webhooks).

---

## 1. Justificación Arquitectónica: HTTPX vs SDK Oficial de MercadoPago

Como arquitectos de software senior, proponemos **NO utilizar el SDK oficial de MercadoPago (`mercadopago`)** y, en su lugar, implementar llamadas directas totalmente asíncronas con **`httpx`** (que ya es una dependencia core instalada y probada en el proyecto).

### Tradeoffs & Ventajas de HTTPX (Recomendado):
- **100% Async / No Bloqueante**: El SDK oficial de MercadoPago para Python es síncrono. En un entorno de alto tráfico con FastAPI, las llamadas síncronas bloquean el event loop de Python, degradando drásticamente el rendimiento de la API. Con `httpx.AsyncClient` realizamos peticiones no bloqueantes nativas.
- **Peso Pluma (Cero dependencias adicionales)**: Evitamos cargar dependencias transitivas e innecesarias de terceros en `requirements.txt`.
- **Control Total de Payloads**: La API de MercadoPago es una API REST estándar. Interactuar directamente con sus endpoints (`/v1/checkout/preferences` y `/v1/payments`) mediante payloads limpios en Pydantic es más legible, flexible y fácil de testear (mockear).

---

## 2. Flujo y Reglas de Negocio

### A. Inicio de Pago (`POST /api/v1/pagos/iniciar`)
1. **Validación del Pedido**: Se comprueba que el pedido exista, pertenezca al usuario autenticado y se encuentre en estado `PENDIENTE`.
2. **Control de Idempotencia**:
   - Se busca si ya existe un registro de `Pago` activo para este `pedido_id` en estado `pending` o `approved`.
   - Si ya existe un pago `pending`, se reutiliza y retorna la preferencia de MercadoPago (`preference_id` e `init_point`) previamente creada para evitar duplicar el flujo en la pasarela.
3. **Generación de Claves**:
   - `idempotency_key`: UUID único que evita que la misma solicitud de cobro sea procesada dos veces por MercadoPago.
   - `external_reference`: Identificador único del pedido enviado a MercadoPago (`pedido_{id}`).
4. **Llamada Asíncrona a MercadoPago**:
   - Se consume el endpoint de preferencias enviando los detalles de los productos (snapshots del detalle del pedido) y el costo de envío.
   - Se incluye el header `X-Idempotency-Key` con nuestra clave de idempotencia.
5. **Creación del Registro**: Se almacena el pago en la base de datos con estado inicial `pending`.

### B. Webhook IPN de MercadoPago (`POST /api/v1/pagos/webhook`)
1. **Validación de Firma (X-Signature)**: Se verifica la firma del webhook contra la clave `MP_WEBHOOK_SECRET` para garantizar la autenticidad de la notificación.
2. **Consulta del Pago**:
   - Si la notificación tiene el tipo de recurso `payment`, se consulta asíncronamente a la API de MercadoPago (`https://api.mercadopago.com/v1/payments/{resource_id}`) para obtener el estado oficial de la transacción.
3. **Procesamiento del Estado**:
   - `approved`: El pago es acreditado. Se actualiza el `Pago` a `approved` y se avanza el estado del `Pedido` de forma atómica a `CONFIRMADO` (llamando a `PedidoService.avanzar_estado` con rol `ADMIN`).
   - `rejected`: El pago es rechazado. Se actualiza el `Pago` a `rejected`. El pedido permanece en `PENDIENTE` para permitir reintentos del cliente.
   - `cancelled` / `refunded`: Se actualiza el registro de pago y se maneja adecuadamente.

---

## 3. Modelo de Datos (`Pago`)

El modelo `Pago` se mapea a la tabla `pagos` con los siguientes campos clave:
- `id: int (PK)`
- `pedido_id: int (FK → Pedido.id, ON DELETE CASCADE)`
- `mp_payment_id: Optional[int] (UQ)` — ID oficial de la transacción en MercadoPago.
- `mp_status: str` — `pending | approved | rejected | cancelled | in_process`
- `mp_status_detail: Optional[str]` — Detalle del estado (ej: `accredited`).
- `external_reference: str (UQ)` — `pedido_{id}`
- `idempotency_key: str (UQ)` — UUID generado.
- `transaction_amount: Decimal(10,2)` — Monto exacto cobrado.
- `payment_method_id: Optional[str]` — Tarjeta, efectivo, MercadoPago, etc.
- `created_at: datetime`
- `updated_at: datetime`

---

## 4. Cambios Propuestos por Archivos

- **[MODIFY] [config.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/core/config.py)**: Añadir `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET` a la configuración global de la app (`Settings`).
- **[NEW] [models.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/pagos/models.py)**: Declarar el modelo de datos `Pago` con SQLModel y configurar relaciones.
- **[NEW] [repository.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/pagos/repository.py)**: Implementar consultas de pagos por pedido, external reference e idempotency key.
- **[NEW] [unit_of_work.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/pagos/unit_of_work.py)**: Integrar `PagoRepository` dentro del ecosistema UoW.
- **[NEW] [schemas.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/pagos/schemas.py)**: Definir esquemas para peticiones de pago, respuestas y payloads del webhook.
- **[NEW] [service.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/pagos/service.py)**: Diseñar la lógica de negocio asíncrona y la validación de firmas digitales.
- **[NEW] [router.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/pagos/router.py)**: Exponer los enrutadores HTTP para el inicio de pago, consulta de historial y el webhook IPN.
- **[MODIFY] [main.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/main.py)**: Registrar el enrutador de pagos `/api/v1/pagos`.
