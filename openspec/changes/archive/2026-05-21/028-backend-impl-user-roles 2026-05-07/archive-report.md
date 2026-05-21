# Archive Report: Change 028 — Backend: Edición de Roles de Usuario

**Fecha de Archivado**: 2026-05-07

## Resolución
Se implementó el flujo completo de gestión de roles de usuarios:
1. **Backend**: 
   - Endpoint `PATCH /api/v1/usuarios/{id}/roles`.
   - Modificación del modelo de respuesta global `UsuarioDetailResponse` en `get_all` para facilitar la renderización en tablas sin llamadas N+1.
2. **Frontend**: 
   - Panel de administración `UsuariosPage.tsx` modificado con 6 columnas.
   - Alternancia de rol (ADMIN/CLIENT) directamente desde la tabla con un botón inteligente que se desactiva para el propio usuario logueado.

Todos los criterios de aceptación y tareas fueron completados y verificados bajo la modalidad Strict TDD y SDD.

## Próximos Pasos (Opcional)
- A futuro se podría migrar la tabla a una estructura paginada si el número de usuarios crece significativamente.
