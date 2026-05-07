# TODO: Implementar modelo DireccionEntrega
#
# Tabla: DireccionEntrega <<Table>>
# Dominio 1 - Identidad & Acceso
#
# Campos:
# - id: BIGSERIAL {PK}
# - usuario_id: BIGINT {FK → Usuario.id, NN}  ← ON DELETE CASCADE
# - alias: VARCHAR(50)  ← opcional, ej: "Casa", "Trabajo"
# - linea1: TEXT {NN}
# - linea2: TEXT
# - ciudad: VARCHAR(100) {NN}
# - provincia: VARCHAR(100)
# - codigo_postal: VARCHAR(10)
# - latitud: DECIMAL(9,6)
# - longitud: DECIMAL(9,6)
# - es_principal: BOOLEAN {NN, DEFAULT false}
#   ← Máximo una por usuario. Validar en Service, NO en FK.
#   ← PATCH /api/v1/direcciones/{id}/principal desactiva la anterior.
# - created_at: TIMESTAMPTZ {NN}
# - updated_at: TIMESTAMPTZ {NN}
# - deleted_at: TIMESTAMPTZ  ← Soft-delete
