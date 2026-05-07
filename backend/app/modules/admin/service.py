# TODO: Implementar servicio de admin
#
# Responsabilidades (TODA la lógica de negocio):
#
# --- Stock Management (rol: STOCK o ADMIN) ---
# - update_stock(producto_id: int, data: StockUpdateRequest) → StockResponse
#   · Verificar que el producto existe y no está soft-deleted (404)
#   · Actualizar stock_cantidad y/o disponible
#   · SET updated_at = now()
#   · Via UoW (usa UoW de productos)
#
# - get_stock_dashboard() → list[StockResponse]
#   · Lista todos los productos con su stock actual
#   · Filtra soft-deleted
#
# Este servicio NO tiene UoW propio: usa los UoW de los módulos
# correspondientes (productos, pedidos) según la operación.
