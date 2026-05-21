# Design: Change 028 — Backend: Edición de Roles de Usuario

## Arquitectura (Backend)
- **Schema (`schemas.py`)**: `UsuarioRoleUpdateRequest` que recibirá un `list[str]` (e.g. `["ADMIN"]` o `["CLIENT"]`).
- **Repository (`repository.py`)**: Opcional, pero se puede utilizar el `UnitOfWork` para manipular los registros de `UsuarioRol`.
- **Service (`service.py`)**: 
  - Validará que el usuario a editar exista.
  - Opcional: Impedir que un administrador se quite el rol `ADMIN` a sí mismo, para evitar bloqueo.
  - Eliminará todos los roles actuales del usuario en `usuario_roles`.
  - Insertará los nuevos roles enviados.
  - Retornará el usuario actualizado con sus nuevos roles (reutilizando `get_me` o armando la respuesta manualmente).
- **Router (`router.py`)**: 
  - `PATCH /api/v1/usuarios/{id}/roles`
  - Protegido por `require_role("ADMIN")`.

## Arquitectura (Frontend)
- **Tipos (`user.types.ts`)**: Añadir interfaz para la actualización de rol si aplica.
- **Service (`usersService.ts`)**: `updateRoles(id: number, roles: string[])`.
- **Componente (`UsuariosPage.tsx`)**: 
  - En la columna de roles, cambiar el badge estático por un selector dropdown que permita al Admin cambiar entre `CLIENT` y `ADMIN`.
  - Alternativa: Un botón "Hacer Admin" o "Remover Admin". Para simplificar la interfaz, un botón de acción rápida o un Switch es lo más amigable.

## Restricciones
- Un administrador no debería poder quitarse el rol de administrador a sí mismo para evitar quedarse fuera del sistema.
