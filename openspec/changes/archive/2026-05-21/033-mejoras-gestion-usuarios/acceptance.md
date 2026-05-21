# Criterios de Aceptación: Mejoras en la Gestión de Usuarios

**ID del Cambio:** `033-mejoras-gestion-usuarios`  

Este documento define las condiciones que debe cumplir el sistema para dar por completadas y aprobadas las tareas de este cambio.

---

## Escenario 1: Creación administrativa de usuarios por un ADMIN
* **Dado** que un usuario administrador está autenticado en el panel de administración,
* **Cuando** envía una solicitud a `POST /usuarios/` con los siguientes datos:
  - Nombre: "Carlos"
  - Apellido: "Perez"
  - Email: "carlos.encargado@thefoodstore.com"
  - Password: "SecurePassword123"
  - Roles: `["ENCARGADO"]`
* **Entonces** el sistema debe:
  - Crear el registro del usuario en la tabla `usuarios` aplicando `get_password_hash` sobre la contraseña.
  - Insertar un registro en la tabla `usuario_roles` vinculando al nuevo usuario con el rol `ENCARGADO`.
  - Devolver un estado de respuesta `201 Created` con el detalle del usuario y sus roles asignados.
  - El nuevo usuario debe poder iniciar sesión en `POST /auth/login` con sus credenciales y recibir su access token correspondiente.

---

## Escenario 2: Listado de usuarios con filtros de rol e inclusión de eliminados
* **Dado** que un usuario administrador solicita la lista de usuarios en `GET /usuarios/`,
* **Cuando** proporciona el parámetro `rol=ENCARGADO`,
* **Entonces** el sistema debe devolver únicamente los usuarios que tengan asignado el rol `ENCARGADO` y el total correspondiente a ese subgrupo.
* **Cuando** proporciona el parámetro `include_deleted=true`,
* **Entonces** el sistema debe incluir en el listado a los usuarios con `deleted_at is not null`.
* **Cuando** proporciona el parámetro `include_deleted=false` (o no lo proporciona),
* **Entonces** el sistema debe omitir por completo del listado a los usuarios que tengan `deleted_at is not null`.

---

## Escenario 3: Soft Delete de usuario y protección de cuenta propia
* **Dado** que un usuario administrador está autenticado en el sistema (ID = 1),
* **Cuando** intenta realizar un soft delete sobre su propia cuenta (`DELETE /usuarios/1`),
* **Entonces** el sistema debe devolver un error `400 Bad Request` indicando que no puede auto-eliminarse.
* **Cuando** el administrador realiza un soft delete sobre otro usuario (`DELETE /usuarios/2`),
* **Entonces** el sistema debe asignar la fecha actual en `deleted_at` del usuario 2 y devolver `204 No Content`.

---

## Escenario 4: Restauración de un usuario con soft delete
* **Dado** que un usuario ha sido eliminado lógicamente (`deleted_at is not null`),
* **Cuando** el administrador envía una solicitud `PATCH /usuarios/{id}/restore`,
* **Entonces** el sistema debe:
  - Limpiar el campo `deleted_at` dejándolo en `None`.
  - Forzar que `is_active` sea `True`.
  - Devolver el detalle del usuario restaurado con un estado `200 OK`.
  - El usuario debe poder iniciar sesión nuevamente de forma normal.
