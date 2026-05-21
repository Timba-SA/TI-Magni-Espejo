# Tasks: Change 028 — Backend: Edición de Roles de Usuario

## Backend

### Fase 1 — Schemas
- [x] 1.1 Crear `UsuarioRoleUpdateRequest` en `schemas.py` que reciba `roles: list[str]`.

### Fase 2 — Service & Unit Of Work
- [x] 2.1 En `UsuarioService`, implementar `update_roles(id: int, data: UsuarioRoleUpdateRequest, current_user_id: int)`.
- [x] 2.2 Impedir que el usuario actual se modifique sus propios roles (si `id == current_user_id`).
- [x] 2.3 Borrar los roles existentes en `usuario_roles` e insertar los nuevos iterando sobre la lista.
- [x] 2.4 Retornar el `UsuarioDetailResponse` actualizado.

### Fase 3 — Router
- [x] 3.1 Implementar `PATCH /api/v1/usuarios/{id}/roles` en `router.py`.
- [x] 3.2 Proteger con `require_role("ADMIN")`.

## Frontend

### Fase 4 — Service
- [x] 4.1 En `usuariosService.ts`, agregar `updateUserRoles(id: number, roles: string[])`.

### Fase 5 — Interfaz
- [x] 5.1 En `UsuariosPage.tsx`, modificar la columna de "Rol" para incluir acciones o un menú desplegable (dropdown) que permita alternar el rol entre ADMIN y CLIENT, llamando a la nueva API y actualizando el estado de la tabla dinámicamente.
- [x] 5.2 Ocultar o deshabilitar la acción de cambiar rol si la fila corresponde al usuario logueado actualmente.
