# Tareas de Implementación: Cookies HttpOnly y Control de Accesos Multi-Rol (037)

Checklist de tareas para la implementación del cambio de seguridad:

## Backend

- [x] Modificar `backend/app/core/dependencies.py` para inyectar `Request` de FastAPI, leer el token desde `request.cookies.get("access_token")`, y prescindir de `OAuth2PasswordBearer`.
- [x] Modificar `backend/app/modules/categorias/router.py` para proteger endpoints de escritura y exportación para `ADMIN`, `ENCARGADO` y `STOCK`.
- [x] Modificar `backend/app/modules/productos/router.py` para:
  - Proteger endpoints de escritura de productos (`POST /productos/`, `PATCH /productos/{id}`, `DELETE /productos/{id}`, `POST /productos/{id}/ingredientes`) y disponibilidad (`PATCH /productos/{id}/disponibilidad`) para `ADMIN`, `ENCARGADO`, `STOCK`.
  - Proteger endpoints de escritura de unidades de medida (`POST /unidades-medida/`, `PATCH /unidades-medida/{id}`, `DELETE /unidades-medida/{id}`) para `ADMIN`, `ENCARGADO`.
- [x] Modificar `backend/app/modules/ingredientes/router.py` para:
  - Restringir endpoints de lectura (`GET /`, `GET /exportar`, `GET /{id}`) a todo el personal (`ADMIN`, `ENCARGADO`, `STOCK`, `PEDIDOS`, `CAJERO`, `COCINERO`).
  - Restringir endpoints de escritura (`POST /`, `PATCH /{id}`, `PATCH /{id}/toggle-active`, `DELETE /{id}`) a `ADMIN`, `ENCARGADO`, `STOCK`.
- [x] Modificar `backend/app/modules/usuarios/router.py` para proteger todos los endpoints administrativos (todos excepto `/me` y `/me` de actualización) requiriendo exclusivamente `ADMIN`.

## Tests

- [x] Adaptar la configuración de pruebas y fixtures o verificar cobertura mediante tests dedicados.
  - Se implementó `backend/tests/test_auth_rbac.py` para verificar de forma dedicada la autenticación basada en cookies HttpOnly y la matriz de roles sin necesidad de overrides.
- [x] Asegurar que toda la suite de tests (`pytest`) pase con éxito.

## Frontend

- [x] Modificar `frontend/src/shared/api/apiClient.ts` para inyectar `credentials: "include"` por defecto y actualizar la interceptación para responder con redirección en caso de `HTTP 401` o `HTTP 403`.
- [x] Modificar `frontend/src/features/categorias/services/categoriasService.ts` para incluir `credentials: "include"` en la exportación manual y manejar la redirección ante expiración.
- [x] Modificar `frontend/src/features/insumos/services/insumosService.ts` para incluir `credentials: "include"` en la exportación manual y manejar la redirección ante expiración.
- [x] Modificar `frontend/src/features/users/services/usersService.ts` para incluir `credentials: "include"` en la exportación manual y manejar la redirección ante expiración.

## Verificación

- [x] Verificar que la redirección funcione en caso de obtener un 403 o 401.
- [x] Comprobar las exportaciones desde el panel de administración.
- [x] Asegurar compilación limpia de TypeScript.
