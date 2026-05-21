# Technical Design: Backend - Integración con MercadoPago (Idempotency y Webhook)

Este documento detalla el diseño de bajo nivel, la estructura de la base de datos, algoritmos de validación y flujos lógicos asíncronos para la integración con MercadoPago.

---

## 1. Diseño de Base de Datos (Relaciones)

```mermaid
erDiagram
    pedidos ||--o{ pagos : "tiene intentos de"
    pedidos {
        bigint id PK
        varchar estado_codigo FK
        decimal total
    }
    pagos {
        bigint id PK
        bigint pedido_id FK "ON DELETE CASCADE"
        bigint mp_payment_id UQ "NULL"
        varchar mp_status "pending | approved | rejected | cancelled"
        varchar mp_status_detail
        varchar external_reference UQ
        varchar idempotency_key UQ
        decimal transaction_amount
        varchar payment_method_id
        timestamp created_at
        timestamp updated_at
    }
```

---

## 2. Flujo Asíncrono de Negocio (Secuencia)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant API as Backend (FastAPI)
    participant DB as SQLite DB (UoW)
    participant MP as API MercadoPago

    Cliente->>API: POST /api/v1/pagos/iniciar {pedido_id}
    API->>DB: Obtener Pedido e intentar recuperar Pago "pending"
    alt Pago pendiente ya existe (Idempotencia)
        DB-->>API: Retornar Pago con preference_id previo
        API-->>Cliente: Retornar URL de Checkout existente
    else Nuevo intento de Pago
        API->>MP: POST /checkout/preferences (Async HTTPX + X-Idempotency-Key)
        MP-->>API: Retornar {preference_id, init_point}
        API->>DB: Crear registro Pago en DB (mp_status="pending")
        API-->>Cliente: Retornar {preference_id, init_point}
    end

    Note over Cliente, MP: El cliente realiza el pago en el Checkout de MercadoPago

    MP->>API: POST /api/v1/pagos/webhook (IPN Notificación con X-Signature)
    API->>API: Validar firma digital con MP_WEBHOOK_SECRET
    API->>MP: GET /v1/payments/{payment_id} (Obtener estado oficial)
    MP-->>API: Retornar estado actual (ej: status="approved", detail="accredited")
    
    alt Pago Aprobado (approved)
        API->>DB: Iniciar Transacción UoW
        API->>DB: Actualizar Pago en DB a status="approved"
        API->>DB: Avanzar Pedido a "CONFIRMADO" (PedidoService.avanzar_estado)
        API->>DB: Confirmar cambios (UoW Commit)
    else Pago Rechazado (rejected)
        API->>DB: Actualizar Pago a status="rejected"
    end
    API-->>MP: Retornar HTTP 200 {"status": "ok"}
```

---

## 3. Algoritmo de Validación de Firma Digital (X-Signature)

Para verificar que las notificaciones del webhook provienen exclusivamente de MercadoPago, implementamos la verificación criptográfica del header `x-signature` que MercadoPago provee:

1. El header `x-signature` tiene el formato: `ts=timestamp,v1=signature`.
2. Se extrae `ts` (timestamp de la petición) y `v1` (la firma hash provista).
3. Se construye el string de firma (`manifest`): `id:${resource_id};ts:${ts}`.
4. Se calcula el HMAC-SHA256 del `manifest` utilizando la clave secreta `MP_WEBHOOK_SECRET`.
5. Se realiza una comparación en tiempo constante (`hmac.compare_digest`) entre el hash calculado y la firma `v1` extraída del header.
6. Si coinciden, el webhook es legítimo. De lo contrario, se rechaza inmediatamente con `401 Unauthorized` o `403 Forbidden`.

*Nota de Simplicidad para Entornos de Testeo*:
En entornos de desarrollo local o durante la ejecución de los tests TDD, si `MP_WEBHOOK_SECRET` no está configurado o es una suite mockeada, se permite bypassear la firma con un log de advertencia para agilizar la integración de pruebas unitarias.

---

## 4. Lógica de Simulación (Mocking) de MercadoPago en los Tests

Dado que no podemos invocar la API real de MercadoPago durante la ejecución de tests aislados, utilizaremos la capacidad nativa de `pytest` y la librería `pytest-mock` (o monkeypatch de FastAPI) para mockear el cliente `httpx.AsyncClient`.
- Para `iniciar_pago`: Simulamos la respuesta de MercadoPago con un JSON estructurado que contenga `id` (preference_id) y `init_point` (checkout URL).
- Para el `webhook`: Generamos un payload simulando la notificación de MercadoPago y mockeamos la consulta a `/v1/payments/{id}` para retornar el estado `approved` o `rejected` que deseamos validar.
