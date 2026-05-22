# Propuesta: Robustecimiento de Seguridad mediante Cookies HttpOnly y Control de Accesos Multi-Rol (037-seguridad-httponly-cookies-rbac)

Esta propuesta describe los cambios necesarios para migrar la estrategia de autenticación del backend de The Food Store de tokens Bearer en headers a cookies inmutables de tipo **HttpOnly**. Asimismo, se asegura la protección completa de las rutas del panel administrativo y se define un control de accesos basado en roles (RBAC) que contempla todos los roles del sistema de manera jerárquica y coherente.

## Motivación y Contexto

Actualmente, el backend permite extraer el JWT desde el header `Authorization` (Bearer). Aunque el login inyecta una cookie `access_token` de tipo `HttpOnly`, la dependencia `get_current_user` en FastAPI se apoya en `OAuth2PasswordBearer` que lee del header.
Esto abre vulnerabilidades en el almacenamiento del frontend, el cual lee el token del `localStorage`. Al usar únicamente cookies HttpOnly:
1. El token no está expuesto a scripts de terceros en el navegador (protección contra XSS).
2. Se uniformiza el backend para depender exclusivamente de las cookies en lugar de headers manuales.
3. Se robustece la seguridad de todas las rutas del panel administrativo (Productos, Categorías, Unidades de Medida, Insumos/Ingredientes y Usuarios) definiendo permisos explícitos según el rol real de cada usuario en el negocio.
4. El frontend redirigirá inmediatamente al login en caso de obtener un 401 o 403.

## Roles del Sistema y Matriz de Permisos

El sistema cuenta con los siguientes roles definidos:
* **ADMIN**: Administrador global con acceso total a todos los endpoints.
* **ENCARGADO**: Supervisor de local. Puede gestionar insumos, catálogo de productos, categorías y unidades de medida.
* **STOCK**: Gestor de Stock. Puede gestionar ingredientes, ver catálogo y modificar la disponibilidad de productos en stock.
* **PEDIDOS**: Gestor de Pedidos. Puede listar y avanzar estados de pedidos.
* **CAJERO**: Cobros y caja. Puede listar, ver y avanzar estados de pedidos.
* **COCINERO**: Preparación de cocina. Puede ver y avanzar estados de pedidos.
* **CLIENT**: Cliente de la tienda. Acceso general público y autogestión de sus pedidos.

### Matriz de Endpoints y Roles Permitidos

| Módulo / Recurso | Endpoints | Roles Permitidos |
| :--- | :--- | :--- |
| **Usuarios** (Gestión) | `GET /me`, `PATCH /me` (Autogestión) | Cualquier usuario autenticado |
| | `GET /`, `GET /exportar`, `POST /`, `PATCH /{id}/toggle-active`, `PATCH /{id}/roles`, `DELETE /{id}`, `PATCH /{id}/restore` | `ADMIN` |
| **Categorías** | `GET /`, `GET /{id}` (Lectura de catálogo) | Libre (Público) |
| | `GET /exportar`, `POST /`, `PATCH /{id}`, `PATCH /{id}/toggle-active`, `DELETE /{id}` (Escritura) | `ADMIN`, `ENCARGADO`, `STOCK` |
| **Productos** | `GET /productos/`, `GET /productos/{id}` (Lectura catálogo) | Libre (Público) |
| | `POST /productos/`, `PATCH /productos/{id}`, `DELETE /productos/{id}`, `POST /productos/{id}/ingredientes` (Escritura Catálogo) | `ADMIN`, `ENCARGADO`, `STOCK` |
| | `PATCH /productos/{id}/disponibilidad` (Inventario) | `ADMIN`, `ENCARGADO`, `STOCK` |
| **Unidades de Medida** | `GET /unidades-medida/`, `GET /unidades-medida/{id}` (Lectura catálogo) | Libre (Público) o cualquier autenticado |
| | `POST /unidades-medida/`, `PATCH /unidades-medida/{id}`, `DELETE /unidades-medida/{id}` (Escritura) | `ADMIN`, `ENCARGADO` |
| **Insumos / Ingredientes** | `GET /`, `GET /exportar`, `GET /{id}` (Lectura) | `ADMIN`, `ENCARGADO`, `STOCK`, `PEDIDOS`, `CAJERO`, `COCINERO` (Todo el personal) |
| | `POST /`, `PATCH /{id}`, `PATCH /{id}/toggle-active`, `DELETE /{id}` (Escritura) | `ADMIN`, `ENCARGADO`, `STOCK` |
| **Pedidos** | `GET /formas-pago` (Formas de pago habilitadas) | Cualquier usuario autenticado |
| | `GET /` (Listar pedidos) | `ADMIN`, `ENCARGADO`, `PEDIDOS`, `CAJERO` (Todos); `CLIENT` (Solo los propios) |
| | `POST /` (Creación de pedidos) | Cualquier usuario autenticado |
| | `GET /{id}` (Ver detalle de pedido) | `ADMIN`, `ENCARGADO`, `PEDIDOS`, `CAJERO`, `COCINERO`; `CLIENT` (Solo el propio) |
| | `PATCH /{id}/estado` (Avanzar estado del pedido) | `ADMIN`, `ENCARGADO`, `PEDIDOS`, `CAJERO`, `COCINERO` |

## Criterios de Aceptación

1. **Autenticación Inmutable**: Cualquier petición a un recurso protegido sin la cookie `access_token` debe fallar con `HTTP 401`.
2. **Rutas Protegidas**: Peticiones a endpoints sensibles sin los roles especificados en la matriz deben fallar con `HTTP 403`.
3. **Frontend Interceptor**: Si el servidor responde con 401 o 403, el frontend destruye la sesión en localStorage y redirige a `/login`.
4. **Exportaciones**: Las exportaciones a Excel de insumos, usuarios y categorías deben seguir funcionando enviando cookies a través de `credentials: "include"`.
