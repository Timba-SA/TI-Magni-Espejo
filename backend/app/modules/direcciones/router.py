# TODO: Implementar router de direcciones
#
# Prefix: /api/v1/direcciones
# Tags: ["Direcciones"]
#
# Endpoints:
# GET    /              → 200 list[DireccionResponse]  [Bearer]
# POST   /              → 201 DireccionResponse         [Bearer]
# PUT    /{id}          → 200 DireccionResponse         [Bearer]
# PATCH  /{id}/principal → 200 DireccionResponse        [Bearer]
# DELETE /{id}          → 204 No Content               [Bearer]
#
# Todos requieren Depends(get_current_user).
# El usuario solo puede operar sus propias direcciones.
# CERO lógica de negocio en el router.
