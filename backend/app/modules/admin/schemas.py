# TODO: Implementar schemas de admin
#
# El módulo admin NO tiene modelos propios.
# Reutiliza los modelos de productos/ y pedidos/.
#
# Schemas requeridos:
#
# --- Stock Management ---
# - StockUpdateRequest: stock_cantidad: int (CHECK >= 0), disponible: bool | None
#   (permite actualizar stock_cantidad y/o toggle disponible independientemente)
#
# - StockResponse: producto_id, nombre, stock_cantidad, disponible, updated_at
#
# Nota: stock_cantidad y disponible son INDEPENDIENTES (ver ERD Producto):
#   stock=0 + disponible=true  → badge "Sin stock" (UI)
#   stock>0 + disponible=false → deshabilitado por operador
