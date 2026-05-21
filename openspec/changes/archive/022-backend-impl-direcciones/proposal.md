# Proposal: Backend - Implementación de Direcciones de Entrega

Este cambio comprende la creación e integración de la entidad `DireccionEntrega` para gestionar múltiples direcciones de envío asociadas a un usuario en The Food Store, permitiendo además designar una única dirección como principal y contemplando un soft-delete de seguridad.

## Contexto y Motivación

La aplicación necesita soportar que un cliente pueda guardar múltiples locaciones (Casa, Trabajo, Casa de Padres, etc.) para facilitar su flujo de pedidos en el Frontend.
Asimismo, es vital contar con una "Dirección Principal" predeterminada para autocompletar el checkout de manera rápida y asegurar que las demás se desmarquen cuando una sea elegida como principal. 
Por motivos de integridad referencial histórica (evitar romper auditorías de pedidos antiguos si el usuario elimina su dirección), la eliminación de direcciones de entrega será realizada mediante un mecanismo de **Soft Delete** (`deleted_at` timestamp).

---

## Alcance del Cambio

### 1. Modelo de Datos (`DireccionEntrega`)
- `id` (PK, int auto-incremental).
- `usuario_id` (FK a `Usuario.id`, con cascada en borrado del usuario físico).
- `alias` (str, opcional, máx 50, ej: "Trabajo").
- `linea1` (str, obligatorio, ej: Calle y número).
- `linea2` (str, opcional, ej: Piso/Depto).
- `ciudad` (str, obligatorio, máx 100).
- `provincia` (str, opcional, máx 100).
- `codigo_postal` (str, opcional, máx 10).
- `latitud` / `longitud` (Decimales, opcionales para futura visualización en mapa).
- `es_principal` (boolean, no nulo, por defecto falso).
- `created_at` / `updated_at` / `deleted_at` (timestamps estándar).

### 2. Reglas de Negocio
- **Dirección Principal Única:** Máximo una dirección principal por usuario. Al establecer una dirección como principal (`PATCH /api/v1/direcciones/{id}/principal`), el sistema debe desmarcar automáticamente cualquier otra dirección principal previa del mismo usuario dentro de una misma transacción.
- **Validación de Propiedad (Ownership):** Un usuario solo puede listar, crear, modificar, establecer como principal o eliminar sus propias direcciones de entrega. Intentar manipular una dirección ajena retornará un error `403 Forbidden`.
- **Integridad de Pedidos Activos (Hard Constraint):** No se permite eliminar (soft-delete) una dirección si ésta tiene asociada algún pedido activo que aún no esté en estado terminal (ej. estados `PENDIENTE`, `CONFIRMADO`, `EN_PREP`, `EN_CAMINO`). Intentar hacerlo retornará un código de error `409 Conflict`.

### 3. Endpoints de API (`/api/v1/direcciones/`)
- `GET /` — Lista todas las direcciones activas del usuario autenticado.
- `POST /` — Crea una nueva dirección. Si es la primera dirección creada por el usuario, se definirá automáticamente como principal (`es_principal = True`).
- `PUT /{id}` — Actualiza los campos de una dirección del usuario (valida propiedad).
- `PATCH /{id}/principal` — Establece una dirección como principal (desactiva la anterior).
- `DELETE /{id}` — Soft delete de la dirección (valida propiedad e integridad de pedidos).

---

## Plan de Verificación Técnico

- **Strict TDD Mode:** Creación previa de tests automatizados completos en `backend/tests/test_direcciones.py` cubriendo:
  - Creación de dirección con asignación automática de principal en la primera.
  - Alternancia transaccional de dirección principal (desactivación de la previa).
  - Bloqueo de manipulación de direcciones ajenas (`403 Forbidden`).
  - Restricción de borrado para direcciones con pedidos activos (`409 Conflict`).
  - Soft-delete satisfactorio y exclusión en listados normales.
