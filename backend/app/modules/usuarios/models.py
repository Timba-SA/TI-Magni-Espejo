# TODO: Implementar modelo Usuario
#
# Tabla: Usuario <<Table>>
# Dominio 1 - Identidad & Acceso
#
# Campos:
# - id: BIGSERIAL {PK}
# - nombre: VARCHAR(80) {NN}
# - apellido: VARCHAR(80) {NN}
# - email: VARCHAR(254) {UQ, NN}  ← validar con EmailStr (Pydantic v2)
# - celular: VARCHAR(20)
# - password_hash: CHAR(60) {NN, bcrypt}  ← NUNCA plaintext, cost >= 12
# - created_at: TIMESTAMPTZ {NN}
# - updated_at: TIMESTAMPTZ {NN}
# - deleted_at: TIMESTAMPTZ  ← Soft-delete: WHERE deleted_at IS NULL en todos los GET
#
# Relaciones:
# - DireccionEntrega: 1 → 0..* (CASCADE)
# - RefreshToken: 1 → 0..* (CASCADE)
# - UsuarioRol: 1 → 0..* (CASCADE)
# - Pedido: 1 → 0..* (RESTRICT)
# - HistorialEstadoPedido: 1 → 0..* (RESTRICT, usuario que modificó)
