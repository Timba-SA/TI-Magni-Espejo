# TODO: Implementar schemas Pydantic de auth
#
# Schemas requeridos:
#
# --- Request ---
# - RegisterRequest: nombre, apellido, email, celular?, password
# - LoginRequest: email, password
# - RefreshRequest: refresh_token
#
# --- Response ---
# - TokenResponse: access_token, refresh_token, token_type="bearer"
# - RolResponse: codigo, nombre, descripcion
# - UsuarioRolResponse: usuario_id, rol_codigo, expires_at?
#
# Validaciones:
# - email: EmailStr (Pydantic v2)
# - password: min 8 chars (validar en schema, hashear en service)
