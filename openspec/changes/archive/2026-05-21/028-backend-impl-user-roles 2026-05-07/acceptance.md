# Acceptance: Change 028 — Backend: Edición de Roles de Usuario

## Criterios de Aceptación
1. **Seguridad Backend**: Solo un usuario con rol `ADMIN` (validado mediante JWT) puede acceder al endpoint `PATCH /api/v1/usuarios/{id}/roles`.
2. **Protección Personal**: Un usuario administrador no puede cambiar sus propios roles (debe recibir un `403 Forbidden` o similar si intenta hacerlo sobre su propio ID).
3. **Flujo de Asignación**: 
   - Enviar `{"roles": ["ADMIN"]}` debe remover el rol `CLIENT` (si lo tenía) y asignar `ADMIN`.
   - La base de datos (`usuario_roles`) debe reflejar correctamente el nuevo rol, sin dejar duplicados.
4. **UI Integrada**: El panel de administración muestra un botón o un switch que permite realizar esta acción fácilmente sin salir de la vista de la tabla, con un loader o notificación que confirme el éxito de la acción.
5. **UI Protegida**: La fila del usuario actualmente logueado en la tabla deshabilita (o esconde) el botón de edición de roles para evitar bloqueos accidentales.
