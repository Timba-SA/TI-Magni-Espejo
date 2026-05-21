# Proposal: Change 028 — Backend: Edición de Roles de Usuario

## Motivación
Actualmente, los roles de los usuarios (como `ADMIN` o `CLIENT`) se asignan por defecto durante el registro o se configuran vía Seed. No existe un mecanismo funcional en el sistema para que un Administrador pueda otorgar o revocar el rol de `ADMIN` a otro usuario desde la interfaz web.

## Alcance
- **Backend**: 
  - Crear el schema `UsuarioRoleUpdateRequest`.
  - Agregar un método en el `UsuarioService` para actualizar los roles de un usuario.
  - Exponer un endpoint `PATCH /api/v1/usuarios/{id}/roles` protegido para administradores.
- **Frontend**:
  - En `UsuariosPage.tsx`, agregar la capacidad de ver y editar los roles de un usuario (e.g., mediante un menú desplegable o botones de acción rápida).

## Fuera de Alcance
- Creación de roles personalizados dinámicos. El sistema seguirá trabajando con los roles fijos predefinidos (`ADMIN`, `CLIENT`).
