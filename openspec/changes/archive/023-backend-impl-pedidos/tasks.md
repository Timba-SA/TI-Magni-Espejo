# Checklist de Implementación: Backend - Pedidos y Máquina de Estados

Este archivo detalla las tareas tácticas ordenadas paso a paso para completar la infraestructura y la máquina de estados de Pedidos.

---

## Fase 1: Pruebas Automatizadas (Strict TDD Mode)
- [x] Crear el archivo de pruebas `backend/tests/test_pedidos.py`.
- [x] Implementar test: Creación de pedido satisfactorio, validando estado inicial `PENDIENTE`, snapshots de producto, creación de historial de estados inicial y reducción de stock.
- [x] Implementar test: Intento de creación con stock insuficiente (debe dar `400 Bad Request` y rollback completo).
- [x] Implementar test: Obtener formas de pago habilitadas (`GET /api/v1/pedidos/formas-pago`).
- [x] Implementar test: Avance de estado exitoso por parte de un ADMIN (`PENDIENTE` -> `CONFIRMADO`).
- [x] Implementar test: Rechazo de transición inválida en la FSM (`PENDIENTE` -> `EN_CAMINO` debe dar `400 Bad Request`).
- [x] Implementar test: Cancelación de pedido por parte de un CLIENT (`CONFIRMADO` -> `CANCELADO` devolviendo stock y registrando motivo).
- [x] Implementar test: Denegación de cancelación de pedido por parte del CLIENT una vez que está en preparación (`EN_PREP` debe dar `403 Forbidden`).
- [x] Implementar test: Exigir obligatoriedad de `motivo` al realizar transición a `CANCELADO`.

---

## Fase 2: Modelado e Infraestructura de DB
- [x] Definir los modelos `Pedido`, `DetallePedido` e `HistorialEstadoPedido` en `backend/app/modules/pedidos/models.py`.
- [x] Implementar los repositorios en `backend/app/modules/pedidos/repository.py`:
  - `PedidoRepository` (con listados específicos y filtros).
  - `DetallePedidoRepository`.
  - `HistorialEstadoPedidoRepository`.
- [x] Implementar la clase `PedidoUoW` en `backend/app/modules/pedidos/unit_of_work.py` y registrar los 5 repositorios.

---

## Fase 3: Capa de Negocio (Schemas, Services & Routers)
- [x] Implementar los esquemas en `backend/app/modules/pedidos/schemas.py`:
  - Request: `ItemPedidoRequest`, `CrearPedidoRequest`, `AvanzarEstadoRequest`.
  - Response: `EstadoPedidoResponse`, `FormaPagoResponse`, `DetallePedidoResponse`, `HistorialEstadoResponse`, `PedidoResponse`, `PedidoDetailResponse`.
- [x] Implementar toda la lógica en `PedidoService` (`backend/app/modules/pedidos/service.py`):
  - Creación transaccional con reducción de stock y snapshots.
  - Validación y control de transiciones FSM con justificación y roles.
  - Sincronización del stock al cancelar.
- [x] Implementar los handlers del router HTTP en `backend/app/modules/pedidos/router.py`.
- [x] Registrar el router de pedidos en `backend/main.py`.

---

## Fase 4: Verificación Final
- [x] Ejecutar la suite de pruebas local (`pytest tests/test_pedidos.py -v`) hasta lograr que todo el pipeline pase a verde.
- [x] Ejecutar el total de la suite de pruebas del backend (`pytest`) para descartar regresiones.
- [x] Registrar los cambios en `changes.md` y redactar `verification.md` de la versión.
- [x] Integrar (mergear) directamente a la rama `master` y subir los cambios limpios de feature a origin sin PR interactiva.
