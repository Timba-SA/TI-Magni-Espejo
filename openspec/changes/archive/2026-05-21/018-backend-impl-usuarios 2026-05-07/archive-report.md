# Archive Report: Change 018 — Backend: Gestión de Usuarios

## Resumen del Cambio
Se implementó el módulo completo de gestión de usuarios en el backend (FastAPI) y su integración en el frontend (React). 
La motivación principal fue dar control a los administradores para listar usuarios y suspender cuentas problemáticas sin borrar el registro histórico.

## Artefactos Generados
- `proposal.md`
- `design.md`
- `tasks.md`
- `acceptance.md`
- `verification.md`

## Modificaciones Estructurales
- **Base de Datos:** Se incorporó el campo `is_active` en la tabla `usuarios`.
- **Backend:** Se creó el módulo `usuarios` con su respectivo router, service, uow, repository y schemas. Se actualizaron las funciones de autenticación en `auth/service.py` para soportar registro e invalidar login de usuarios inactivos.
- **Frontend:** Se creó la página `UsuariosPage.tsx` con soporte nativo de Theming, integrando el servicio `usersService.ts` a la nueva API de backend. Se arregló el renderizado condicional en `Navbar.tsx` para no mostrar "Login/Register" tras autenticarse.

## Conclusión
El cambio ha sido totalmente verificado, testeado y marcado como completado. El módulo puede archivarse.
