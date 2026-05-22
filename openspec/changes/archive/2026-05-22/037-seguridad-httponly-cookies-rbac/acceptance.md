# Criterios de Aceptación: Cookies HttpOnly y Control de Accesos Multi-Rol (037)

Este documento detalla los escenarios de prueba automatizados y manuales necesarios para dar por válido e implementar este cambio.

## Escenarios de Backend

### Escenario 1: Solicitud protegida sin cookie de autenticación
- **Dado** que un usuario intenta realizar una petición a un recurso protegido (ej. `GET /usuarios/me` o `POST /categorias/`).
- **Cuando** no se envía la cookie `access_token` en la petición.
- **Entonces** el servidor debe responder inmediatamente con `HTTP 401 Unauthorized`.

### Escenario 2: Solicitud protegida con cookie inválida o expirada
- **Dado** que un usuario envía una cookie `access_token` modificada, mal formada o expirada.
- **Cuando** se procesa la validación del JWT en `decode_access_token`.
- **Entonces** el servidor debe responder con `HTTP 401 Unauthorized` y el detalle `"Token inválido o expirado."`.

### Escenario 3: Acceso no autorizado a rutas administrativas por rol insuficiente
- **Dado** un usuario autenticado con rol `CLIENT`.
- **Cuando** intenta realizar una operación administrativa en categorías (ej. `POST /categorias/`) o ingredientes (ej. `GET /ingredientes/`).
- **Entonces** el servidor debe denegar el acceso y retornar `HTTP 403 Forbidden`.

### Escenario 4: Acceso correcto de rol intermedio (STOCK)
- **Dado** un usuario autenticado con rol `STOCK`.
- **Cuando** realiza operaciones de escritura de ingredientes (ej. `POST /ingredientes/`) o cambia la disponibilidad de un producto (ej. `PATCH /productos/{id}/disponibilidad`).
- **Entonces** el servidor procesa con éxito retornando `HTTP 200 OK` o `HTTP 201 Created`.

### Escenario 5: Intento de cambiar roles de usuarios sin ser ADMIN
- **Dado** un usuario autenticado con rol `ENCARGADO` u otro rol que no sea `ADMIN`.
- **Cuando** intenta editar los roles de otro usuario (`PATCH /usuarios/{id}/roles`).
- **Entonces** el servidor deniega la operación con `HTTP 403 Forbidden`.

### Escenario 6: Acceso correcto de administrador global (ADMIN)
- **Dado** un usuario autenticado con rol `ADMIN`.
- **Cuando** realiza cualquier operación en categorías, productos, ingredientes o usuarios.
- **Entonces** el servidor debe procesar la petición con éxito.

---

## Escenarios de Frontend

### Escenario 7: Intercepción y Redirección en el Cliente API
- **Dado** un usuario que tiene guardada una sesión en `localStorage` pero su sesión expiró en el servidor.
- **Cuando** realiza una petición que resulta en un error `401 Unauthorized` o `403 Forbidden`.
- **Entonces** el cliente de API (`fetchApi`) intercepta la respuesta, destruye el `localStorage` (eliminando `the_food_store_token` y `the_food_store_session`) y redirige automáticamente al usuario a `/login`.

### Escenario 8: Exportaciones con credenciales HttpOnly
- **Dado** un usuario autenticado con permisos de exportación (ej. `ADMIN`).
- **Cuando** solicita exportar la planilla de ingredientes, categorías o usuarios.
- **Entonces** el navegador adjunta automáticamente la cookie en la petición `fetch` manual (gracias a `credentials: "include"`) y el servidor genera y descarga exitosamente el archivo `.xlsx`.
