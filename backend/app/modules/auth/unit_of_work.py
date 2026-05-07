# TODO: Implementar UnitOfWork de auth
#
# Extiende el UnitOfWork base para exponer los repositorios
# del módulo de autenticación como propiedades lazy-initialized.
#
# Repositorios a exponer:
# - roles: RolRepository
# - usuario_roles: UsuarioRolRepository
# - refresh_tokens: RefreshTokenRepository
#
# Patrón: igual a productos/unit_of_work.py
