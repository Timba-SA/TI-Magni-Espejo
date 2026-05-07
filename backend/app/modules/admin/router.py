# TODO: Implementar router de admin
#
# Prefix: /api/v1/admin
# Tags: ["Admin"]
#
# Endpoints de Stock (rol: STOCK o ADMIN):
# GET   /stock              → 200 list[StockResponse]   [Bearer, STOCK|ADMIN]
# PATCH /stock/{producto_id} → 200 StockResponse        [Bearer, STOCK|ADMIN]
#
# Todos requieren Depends(get_current_user) + verificación de rol en service.
# CERO lógica de negocio en el router.
#
# Nota: la gestión de roles de usuarios (asignar/revocar) puede ir aquí
# si el scope lo requiere, con endpoint:
# POST /usuarios/{id}/roles → 200 [solo ADMIN]
