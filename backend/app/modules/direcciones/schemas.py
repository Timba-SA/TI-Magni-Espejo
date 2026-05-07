# TODO: Implementar schemas de direcciones
#
# Schemas requeridos:
#
# --- Request ---
# - DireccionCreateRequest: linea1, linea2?, ciudad, provincia?, codigo_postal?, alias?,
#                           latitud?, longitud?
# - DireccionUpdateRequest: mismos campos opcionales
#
# --- Response ---
# - DireccionResponse: id, usuario_id, alias?, linea1, linea2?, ciudad, provincia?,
#                      codigo_postal?, latitud?, longitud?, es_principal, created_at
#
# Nota: deleted_at NUNCA se expone en responses.
