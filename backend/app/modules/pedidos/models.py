# TODO: Implementar modelos del Dominio 3 - Ventas
#
# --- EstadoPedido <<Catalog>> ---
# PK semántica: codigo VARCHAR(20)
# Seed obligatorio: PENDIENTE | CONFIRMADO | EN_PREP | EN_CAMINO | ENTREGADO | CANCELADO
# - descripcion: VARCHAR(80) {NN}
# - orden: INT {NN}  ← define el orden visual en UI
# - es_terminal: BOOLEAN {NN}  ← true = no admite transiciones salientes
#
# FSM (validar en Service, NUNCA en Router):
# PENDIENTE  → CONFIRMADO, CANCELADO
# CONFIRMADO → EN_PREP, CANCELADO
# EN_PREP    → EN_CAMINO, CANCELADO*  (*solo ADMIN/PEDIDOS)
# EN_CAMINO  → ENTREGADO
# ENTREGADO  → (terminal)
# CANCELADO  → (terminal)
#
# RN-01: es_terminal=true → 0 transiciones salientes
# RN-05: motivo obligatorio si estado_hacia = CANCELADO
#
# --- FormaPago <<Catalog>> ---
# PK semántica: codigo VARCHAR(20)
# Seed: MERCADOPAGO | EFECTIVO | TRANSFERENCIA
# - descripcion: VARCHAR(80) {NN}
# - habilitado: BOOLEAN {NN, DEFAULT true}
#   habilitado=false: oculto en nuevo checkout, visible en historial
#
# --- Pedido <<Table>> ---
# - id: BIGSERIAL {PK}
# - usuario_id: BIGINT {FK → Usuario.id, NN}
# - direccion_id: BIGINT {FK → DireccionEntrega.id, SET NULL}
#   NULL = retiro en local (válido)
# - estado_codigo: VARCHAR(20) {FK → EstadoPedido.codigo, NN}
# - forma_pago_codigo: VARCHAR(20) {FK → FormaPago.codigo, NN}
# Snapshot monetario (inmutable desde creación):
# - subtotal: DECIMAL(10,2) {NN, snap}
# - descuento: DECIMAL(10,2) {NN, DEFAULT 0.00, snap}
# - costo_envio: DECIMAL(10,2) {NN, DEFAULT 50.00, snap}
# - total: DECIMAL(10,2) {NN, CHECK >= 0, snap}
#   total = subtotal - descuento + costo_envio
# - notas: TEXT
# - created_at, updated_at: TIMESTAMPTZ {NN}
# - deleted_at: TIMESTAMPTZ (soft-delete)
#
# --- DetallePedido <<Table>> ---
# PK compuesta: (pedido_id, producto_id)
# - pedido_id: FK → Pedido.id CASCADE
# - producto_id: FK → Producto.id RESTRICT
#   RESTRICT: preserva integridad histórica
# - cantidad: SMALLINT {NN, CHECK >= 1}
# Snapshot (inmutable, RN-04):
# - nombre_snapshot: VARCHAR(200) {NN, snap}
# - precio_snapshot: DECIMAL(10,2) {NN, CHECK >= 0, snap}
# - subtotal_snap: DECIMAL(10,2) {NN, snap}  = precio_snapshot * cantidad
# - personalizacion: INTEGER[]  ← IDs de Ingrediente removidos
#   Solo es_removible=true. Ver ProductoIngrediente.
# - created_at: TIMESTAMPTZ {NN}
# SIN updated_at: fila INMUTABLE por diseño (RN-04)
#
# --- HistorialEstadoPedido <<Append>> ---
# APPEND-ONLY: solo INSERT, NUNCA UPDATE ni DELETE (RN-03)
# - id: BIGSERIAL {PK}
# - pedido_id: BIGINT {FK → Pedido.id, CASCADE}
# - estado_desde: VARCHAR(20) {FK → EstadoPedido.codigo, NULL}
#   NULL = transición inicial / creación del pedido (RN-02)
# - estado_hacia: VARCHAR(20) {FK → EstadoPedido.codigo, NN}
# - usuario_id: BIGINT {FK → Usuario.id, NULL}
#   NULL = actor sistema (ej: webhook MP)
# - motivo: TEXT  ← obligatorio si estado_hacia = CANCELADO (RN-05)
# - created_at: TIMESTAMPTZ {NN, append-only}
# SIN updated_at por diseño
