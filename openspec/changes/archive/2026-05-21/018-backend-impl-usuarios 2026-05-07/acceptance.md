# Acceptance: Change 018 — Backend: Gestión de Usuarios

## Criterios de aceptación

### Backend

- [ ] `GET /api/v1/usuarios/me` devuelve `UsuarioDetailResponse` con los roles del usuario autenticado
- [ ] `PATCH /api/v1/usuarios/me` actualiza nombre/apellido/celular y devuelve `UsuarioResponse`; el email NO es modificable
- [ ] `GET /api/v1/usuarios/` devuelve lista de usuarios activos solo para ADMIN; retorna 403 para usuarios sin ese rol
- [ ] `PATCH /api/v1/usuarios/{id}/toggle-active` alterna `is_active`; un admin NO puede desactivarse a sí mismo (retorna 400)
- [ ] `password_hash` nunca aparece en ningún response
- [ ] Usuarios con `deleted_at IS NOT NULL` NO aparecen en ningún listado
- [ ] El `UsuarioRepository` NUNCA hace commit/rollback (lo hace el UoW)

### Frontend

- [ ] La tabla de usuarios muestra: ID, Nombre completo, Email, Rol(es), Estado (activo/suspendido)
- [ ] El botón de toggle cambia el estado visualmente sin recargar la página
- [ ] La ruta `/usuarios` está registrada y accesible desde el sidebar del panel admin
- [ ] Los estilos usan variables CSS `--tfs-*` (compatible con dark/light mode)
