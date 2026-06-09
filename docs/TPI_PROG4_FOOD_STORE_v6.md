🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **FOOD STORE** 

Sistema de Gestión de Pedidos de Comida _Especificación Técnica del Sistema_ 

**Versión 6.0  ·  Feature-First** 

|**Materia**|Programación 4|
|---|---|
|**Carrera**|Tecnicatura Universitaria en Programación (TUP)|
|**Modalidad**|Trabajo Práctico Integrador (TPI)|
|**Stack**|React + TypeScript + FastAPI + PostgreSQL + WebSocket + Cloudinary|
|**Versión doc.**|6.0 — UML v7 + WebSocket + Cloudinary + Feature-First|



Programación 4 — TUP Página 1 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **1. Visión General del Sistema** 

Food Store es una aplicación web full-stack para la gestión integral de un negocio de comidas. Permite a los clientes explorar el catálogo, agregar productos al carrito, realizar pedidos con pago integrado vía MercadoPago y hacer seguimiento en tiempo real del estado de su pedido mediante WebSocket. Los administradores gestionan el catálogo (con imágenes gestionadas por Cloudinary), el stock, los pedidos y los usuarios desde un panel centralizado. 

## **1.1 Objetivos del Sistema** 

|**#**|**Actor**|**Objetivo principal**|
|---|---|---|
|OBJ-01|Cliente|Navegar el catálogo, gestionar carrito, pagar con MercadoPago y rastrear pedidos en<br>tiempo real vía WebSocket.|
|OBJ-02|Administrador|Gestionar categorías, productos (con imágenes Cloudinary), stock y ciclo de vida de<br>pedidos.|
|OBJ-03|Gestor de<br>Stock|Controlar disponibilidad  y cantidad de stock.|
|OBJ-04|Gestor de<br>Pedidos|Avanzar estados de pedidos según la máquina de estados FSM definida.|
|OBJ-05|Sistema|Visualizar cambios de estado en tiempo real a clientes y admins vía WebSocket.|
|OBJ-06|Sistema|Gestionar imágenes de productos y categorías en Cloudinary.|
|OBJ-07|Sistema|Garantizar trazabilidad completa de transiciones de estado mediante audit trail<br>append-only.|
|OBJ-08|Sistema|Procesar y registrar pagos a través de la pasarela MercadoPago.|



## **1.2 Alcance v6.0** 

- Autenticación y autorización con JWT y RBAC (4 roles) + invalidación de refresh token 

- Catálogo de productos con categorías jerárquicas, ingredientes (es_alergeno) y unidades de medida 

- Imágenes de productos y categorías gestionadas por Cloudinary (upload, transformaciones, eliminación) 

- • Carrito de compras con persistencia mediante Zustand + localStorage 

- Gestión de pedidos con máquina de estados de 5 estados y audit trail append-only 

- Pasarela de pagos MercadoPago Checkout PRO: tarjeta de crédito/débito, Dinero en cuenta 

- WebSocket en tiempo real para cambios de estado de pedidos 

- Webhook de MercadoPago para confirmación automática de pagos 

- Módulo DireccionEntrega: CRUD completo con dirección principal por usuario 

- Panel de administración: dashboard con graficos, CRUD de entidades, gestión de pedidos y stock 

- Rate limiting: máximo 5 intentos fallidos por IP en 15 minutos en el login/register 

- CORS configurado correctamente con CORSMiddleware para la separación frontend/backend 

- Seed data obligatorio: roles, estados de pedido, formas de pago, unidades de medida y usuario admin 

- API REST documentada con FastAPI/OpenAPI — accesible en /docs y /redoc 

Programación 4 — TUP Página 2 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **1.3 Stack Tecnológico** 

|**Capa**|**Tecnología**|**Versión**|**Rol en el sistema**|
|---|---|---|---|
|Frontend|React + TypeScript|18.x + 5.x|UI, enrutamiento, componentes|
|Frontend|Vite|5.x|Build tool y dev server|
|Frontend|Tailwind CSS|3.x|Estilos utility-first|
|Frontend|TanStack Query|5.x|Fetching, caché y sincronización de datos del<br>servidor|
|Frontend|TanStack Form|0.x|Gestión de formularios con validación|
|Frontend|Zustand|4.x|Estado global del cliente (carrito, sesión, pagos,<br>WS, UI)|
|Frontend|Axios|1.x|Cliente HTTP con interceptors JWT|
|Frontend|recharts, react-chartjs-2,etc…|2.x|Gráficos del dashboard de administración|
|Frontend|@mercadopago/sdk-react|—|SDK oficial MercadoPago para tokenización<br>PCI-compliant|
|Backend|FastAPI|0.111+|Framework REST + WebSocket + generación<br>automática OpenAPI|
|Backend|SQLModel|0.0.19+|ORM + schemas Pydantic integrados|
|Backend|PostgreSQL|15+|Base de datos relacional|
|Backend|Passlib (bcrypt)|—|Hashing de contraseñas (cost factor ≥ 12)|
|Backend|mercadopago|2.3.0+|SDK oficial MercadoPago Python|
|Backend|cloudinary|1.x+|SDK Python para upload y gestión de imágenes|



Programación 4 — TUP Página 3 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **2. Arquitectura del Sistema** 

## **2.1 Capas del Backend — Flujo de Dependencias** 

El backend aplica una arquitectura de capas con módulos por feature. El patrón Unit of Work (UoW) se ubica entre la capa de servicio y los repositorios, garantizando atomicidad transaccional. El WebSocket Manager (WSManager) reside en el core y es invocado por la capa de servicio para emitir notificaciones después del commit. El flujo de dependencias es unidireccional y no puede invertirse. 

_Figura 1 — Capas del backend y flujo de dependencias unidireccional_ 

Regla de oro — flujo de imports: Router → Service → UoW → Repository → Model WSManager es invocado por Service DESPUÉS del commit (fuera del bloque UoW). Ninguna capa puede importar de la capa superior. 

|**Capa**|**Archivo de referencia**|**Responsabilidad**|**Conoce a**|
|---|---|---|---|
|Router|router.py|HTTP puro: parsear request, validar<br>schema Pydantic, delegar al Service,<br>serializar response.|Service|
|Service|service.py|Lógica de negocio: stateless, orquesta<br>repos a través del UoW. Emite eventos<br>WS post-commit.|UoW, WSManager|
|Unit of Work|core/uow.py|Gestión de transacción: sesión de BD,<br>acceso a repositorios, commit/rollback<br>automático.|Repository, Session|
|WS Manager|core/websocket.py|Gestión del pool de conexiones<br>WebSocket. Broadcast a suscriptores por<br>pedido_id o canal admin.|WebSocket<br>Connections|
|Repository|repository.py|Acceso a BD: queries sin lógica de<br>negocio. Hereda de BaseRepository[T].|Model, Session|
|Model|model.py|SQLModel tables + relaciones. Sin<br>imports de capas superiores.|Ninguna|



## **2.2 Capas del Frontend — Feature-Sliced Design** 

El frontend aplica Feature-Sliced Design. Cada feature es autocontenida. Los imports fluyen de arriba hacia abajo: Pages → Features → Hooks/Stores → API → Types. El hook useOrderStatus encapsula la conexión WebSocket y se comunica con el orderStatusStore de Zustand. 

_Figura 2 — Capas del frontend con WebSocket y Cloudinary_ 

Separación de responsabilidades frontend: Zustand gestiona estado del CLIENTE: carrito, sesión, proceso de pago, estado WS, UI local. TanStack Query gestiona estado del SERVIDOR: productos, pedidos, dashboard. Cloudinary Upload Widget gestiona el ciclo de vida de imágenes fuera del form. 

## **2.3 Módulos Backend (Feature-First)** 

|**Módulo**|**Ruta**|**Descripción**|
|---|---|---|
|auth|app/modules/auth/|Login, registro, refresh, logout. JWT access (30 min) + refresh<br>(7 días). Rate limiting.|
|usuarios|app/modules/usuarios/|CRUD usuarios + asignación de roles RBAC. Soft delete.|
|direcciones|app/modules/direcciones/|CRUD completo DireccionEntrega por usuario. PATCH<br>/principal.|



Programación 4 — TUP Página 4 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

|categorias|app/modules/categorias/|Categorías jerárquicas con CTE recursiva + gestión de imagen<br>Cloudinary. Soft delete.|
|---|---|---|
|productos|app/modules/productos/|Catálogo con Ingrediente, UnidadMedida e imagenes_url[] vía<br>Cloudinary. Stock.|
|pedidos|app/modules/pedidos/|Dominio central: FSM, audit trail, historial append-only. Emite<br>eventos WS post-commit.|
|pagos|app/modules/pagos/|Integración MercadoPago: crear pago, webhook IPN, registro<br>de transacciones.|
|uploads|app/modules/uploads/|Upload y eliminación de imágenes en Cloudinary. Devuelve<br>URL + public_id.|
|ws|app/core/ws_manager.py|WebSocket Manager: pool de conexiones, broadcast por<br>pedido_id y canal admin.|
|admin|app/modules/admin/|Dashboard con métricas, gestión de stock y usuarios desde el<br>panel.|



Programación 4 — TUP Página 5 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **3. Modelo de Datos — UML v7** 

El esquema aplica Tercera Forma Normal (3FN), Soft Delete (deleted_at TIMESTAMPTZ), Snapshot Pattern en pedidos y Audit Trail append-only en HistorialEstadoPedido. La versión 7 incorpora: Cloudinary en imágenes de Producto y Categoría (imagenes_url TEXT[], imagen_url TEXT), la nueva entidad UnidadMedida, 5 estados de pedido (se elimina EN_CAMINO) y el campo expires_at en UsuarioRol. 

## **3.1 Dominio 1 — Identidad y Acceso** 

|**Entidad**|**Campo clave**|**Tipo**|**Restricción**|**Notas**|
|---|---|---|---|---|
|Usuario|id|BIGSERIAL|PK|Soft-delete vía deleted_at|
|Usuario|email|VARCHAR(254)|UQ, NN|Validar con EmailStr (Pydantic<br>v2)|
|Usuario|celular|VARCHAR(20)|NULL|Campo nuevo en v7|
|Usuario|password_hash|CHAR(60)|NN|bcrypt cost≥12. NUNCA<br>almacenar plaintext|
|Rol|codigo|VARCHAR(20)|PK (semántica)|ADMIN │ STOCK │ PEDIDOS<br>│ CLIENT|
|UsuarioRol|(usuario_id,<br>rol_codigo)|BIGINT +<br>VARCHAR|PK compuesta|Pivot N:M. Incluye<br>asignado_por_id|
|UsuarioRol|expires_at|TIMESTAMPTZ|NULL|Nuevo v7 — rol temporal<br>opcional|
|DireccionEntreg<br>a|alias|VARCHAR(50)|NULL|Ej: 'Casa', 'Trabajo'|
|DireccionEntreg<br>a|es_principal|BOOLEAN|NN, default<br>false|Solo una por usuario|



## **3.2 Dominio 2 — Catálogo de Productos** 

|**Entidad**|**Campo clave**|**Tipo**|**Restricción**|**Notas**|
|---|---|---|---|---|
|Categoria|parent_id|BIGINT|FK self-ref, NULL|Jerarquía recursiva. ON<br>DELETE SET NULL. CTE.|
|Categoria|imagen_url|TEXT|NULL|URL de imagen en<br>Cloudinary|
|Producto|precio_base|DECIMAL(10,2)|CHECK ≥ 0, NN|Snapshot al crear pedido|
|Producto|imagenes_url|TEXT[]|NULL|Array de URLs Cloudinary<br>(múltiples imágenes)|
|Producto|unidad_venta_id|BIGINT|FK →<br>UnidadMedida.id<br>, NULL|Nueva v7 — ej: kg, unidad,<br>litro|
|Producto|stock_cantidad|INTEGER|CHECK ≥ 0, NN,<br>default 0|Gestionado por rol STOCK|
|Producto|disponible|BOOLEAN|NN, default true|Toggle manual<br>independiente del stock|
|Ingrediente|nombre|VARCHAR(100)|UQ, NN|Especificación completa en<br>v7|



Programación 4 — TUP Página 6 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

|Ingrediente|stock_cantidad|INTEGER|NN, CHECK ≥ 0,<br>DEFAULT 0|Nuevo v7 — stock del<br>ingrediente|
|---|---|---|---|---|
|Ingrediente|es_alergeno|BOOLEAN|NN, default false|Badge de alérgenos en UI|
|UnidadMedida|id|BIGSERIAL|PK|Entidad nueva en v7|
|UnidadMedida|nombre|VARCHAR(50)|UQ, NN|Ej: kilogramo, litro, unidad|
|UnidadMedida|simbolo|VARCHAR(10)|UQ, NN|Ej: kg, L, ud — mostrado<br>en ProductCard|
|UnidadMedida|tipo|VARCHAR(20)|NN|Ej: peso, volumen,<br>contable|
|ProductoCategoria|(producto_id, cat_id)|BIGINT×2|PK compuesta|Pivot N:M. es_principal.|
|ProductoIngredient<br>e|es_removible|BOOLEAN|NN|Habilita personalización<br>del pedido|
|ProductoIngredient<br>e|cantidad|DECIMAL(10,3)|NN, CHECK > 0|Nuevo v7 — cantidad del<br>ingrediente|
|ProductoIngredient<br>e|unidad_medida_id|BIGINT|FK →<br>UnidadMedida.id<br>, NN|Nuevo v7|
|FormaPago|codigo|VARCHAR(20)|PK semántica|MERCADOPAGO │<br>EFECTIVO │<br>TRANSFERENCIA|



## **3.3 Dominio 3 — Ventas, Pagos y Trazabilidad** 

|**Entidad**|**Campo clave**|**Tipo**|**Restricción**|**Notas**|
|---|---|---|---|---|
|EstadoPedido|codigo|VARCHAR(20)|PK semántica|Catálogo. Ver<br>máquina de<br>estados.|
|EstadoPedido|es_terminal|BOOLEAN|NN|true = no admite<br>transiciones<br>salientes|
|Pedido|estado_codigo|VARCHAR(20)|FK → EstadoPedido|Estado actual del<br>pedido|
|Pedido|subtotal|DECIMAL(10,2)|NN, snap|Nuevo v7 — suma<br>de items sin<br>descuento|
|Pedido|descuento|DECIMAL(10,2)|NN, default 0.00,<br>snap|Nuevo v7 —<br>descuento aplicado|
|Pedido|costo_envio|DECIMAL(10,2)|NN, default 50.00|Valor fijo v1.|
|Pedido|total|DECIMAL(10,2)|CHECK ≥ 0, NN|subtotal - descuento<br>+ costo_envio|
|DetallePedido|nombre_snapshot|VARCHAR(200)|NN, snap|Snapshot: nombre al<br>crear. Inmutable.|
|DetallePedido|precio_snapshot|DECIMAL(10,2)|NN, snap|Snapshot: precio al<br>crear. Inmutable.|
|DetallePedido|subtotal_snap|DECIMAL(10,2)|NN, snap|Nuevo v7 —<br>precio_snapshot ×<br>cantidad|



Programación 4 — TUP Página 7 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

|DetallePedido|personalizacion|INTEGER[]|NULL|IDs de ingredientes<br>removidos|
|---|---|---|---|---|
|HistorialEstadoPedid<br>o|estado_desde|VARCHAR(20)|FK, NULL|NULL = transición<br>inicial (RN-02)|
|HistorialEstadoPedid<br>o|estado_hacia|VARCHAR(20)|FK →<br>EstadoPedido.codigo,<br>NN|Estado destino de la<br>transición|
|HistorialEstadoPedid<br>o|created_at|TIMESTAMPTZ|NN, append-only|Nunca updated_at.<br>Append-only<br>(RN-03).|
|Pago|mp_payment_id|BIGINT|UQ, NULL|ID devuelto por<br>MercadoPago|
|Pago|mp_status|VARCHAR(30)|NN|pending / approved /<br>rejected|
|Pago|mp_status_detail|VARCHAR(100)|NULL|Nuevo v7 — detalle<br>del estado MP|
|Pago|transaction_amount|DECIMAL(10,2)|NN|Nuevo v7 — monto<br>cobrado por MP|
|Pago|payment_method_id|VARCHAR(50)|NULL|Nuevo v7 — método<br>usado (visa,<br>master…)|
|Pago|external_reference|VARCHAR(100)|UQ, NN|UUID del Pedido<br>como referencia MP|
|Pago|idempotency_key|VARCHAR(100)|UQ, NN|UUID generado por<br>backend. Evita<br>cobros duplicados.|



## **3.4 Máquina de Estados — Pedido (v7: 5 estados)** 

_Figura 3 — Máquina de estados del Pedido (FSM) v7. Se elimina EN_CAMINO de la v5._ 

|**Código**|**Descripción**|**Orden**|**es_terminal**|**Transiciones válidas**|
|---|---|---|---|---|
|PENDIENTE|Pedido creado, pago<br>pendiente|1|false|→ CONFIRMADO, → CANCELADO|
|CONFIRMADO|Pago procesado y<br>confirmado|2|false|→ EN_PREP, → CANCELADO|
|EN_PREP|En preparación en cocina|3|false|→ ENTREGADO, → CANCELADO<br>(solo ADMIN/PEDIDOS)|
|ENTREGADO|Entrega confirmada|4|TRUE✓|— (estado terminal)|
|CANCELADO|Pedido cancelado|5|TRUE✓|— (estado terminal)|



Reglas de negocio — Pedidos: RN-01: Un estado con es_terminal = true no admite transiciones salientes. Validación en Service. RN-02: El primer registro de HistorialEstadoPedido siempre tiene estado_desde = NULL. RN-03: La tabla HistorialEstadoPedido es append-only. Ninguna capa puede emitir UPDATE ni DELETE. RN-04: El total, nombre y precio en DetallePedido son un snapshot inmutable al crear el pedido. RN-05: El motivo es obligatorio si nuevo_estado = CANCELADO. RN-06:   Al completar avanzar_estado() con éxito, el Service llama WSManager.broadcast() FUERA del bloque UoW. 

Programación 4 — TUP Página 8 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **4. Autenticación y Autorización** 

## **4.1 Flujo de Autenticación** 

|**Paso**|**Actor**|**Acción**|**Resultado esperado**|
|---|---|---|---|
|1|Cliente|POST /api/v1/auth/login con email +<br>password|HTTP 200 + access token (30 min) +<br>refresh token (7 días)|
|2|Frontend|Almacena access token en cookies only<br>http|Token disponible para interceptor Axios|
|4|Backend|Dependency get_current_user() valida<br>JWT y carga el usuario|Objeto usuario inyectado en el handler|
|5|Backend|require_role([Rol.ADMIN]) verifica roles<br>del token|HTTP 403 si rol insuficiente|
|6|Cliente|POST /api/v1/auth/refresh con refresh<br>token|Nuevo access token sin requerir re-login|
|7|Cliente|POST /api/v1/auth/logout|Refresh token marcado como revoked_at<br>en tabla RefreshToken|



## **4.2 Roles y Permisos (RBAC)** 

|**Rol**|**Código**|**Permisos principales**|**Restricciones**|
|---|---|---|---|
|Administrador|ADMIN|CRUD completo: usuarios, categorías,<br>productos (imágenes Cloudinary), pedidos,<br>stock.|Sin restricciones.|
|Gestor de Stock|STOCK|Leer productos, actualizar stock_cantidad y<br>disponible, ver ingredientes.|Sin acceso a usuarios ni<br>datos financieros.|
|Gestor de<br>Pedidos|PEDIDOS|Ver todos los pedidos, avanzar estados<br>CONFIRMADO → EN_PREPARACION →<br>ENTREGADO, ver historial.|Sin acceso a productos ni<br>finanzas.|
|Cliente|CLIENT|Ver catálogo, gestionar carrito, crear pedidos,<br>ver sus propios pedidos.|Solo accede a sus propios<br>datos.|



## **4.3 Rate Limiting en Autenticación** 

|**Configuración**|**Valor**|
|---|---|
|Límite|5 intentos fallidos por dirección IP en 15 minutos|
|Endpoint protegido|Login y Registro|
|Respuesta al superar|HTTP 429 Too Many Requests con header Retry-After|



Programación 4 — TUP Página 9 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **5. Especificación de API REST** 

Todos los endpoints usan el prefijo /api/v1. Los errores siguen RFC 7807 (Problem Details). La documentación interactiva se genera automáticamente en /docs (Swagger UI) y /redoc. Los endpoints WebSocket se documentan por separado en la Sección 9. 

Convenciones globales: Error estándar RFC 7807: { "detail": "mensaje", "code": "ERROR_CODE", "field": "campo_opcional" } Paginación: GET /recursos?page=1&size=20 → { "items": [...], "total": N, "page": 1, "size": 20, "pages": P } Soft delete: todos los GET filtran WHERE deleted_at IS NULL. 

## **5.1 Módulo Auth** 

|**Método**|**Endpoint**|**Body / Params**|**Response**|**Auth requerida**|
|---|---|---|---|---|
|POST|/api/v1/auth/register|{ nombre, apellido, email,<br>password }|201 UserResponse|No|
|POST|/api/v1/auth/login|{ email, password }|200<br>TokenResponse|No — rate limited<br>5/15min|
|POST|/api/v1/auth/refresh|{ refresh_token }|200<br>TokenResponse|No|
|POST|/api/v1/auth/logout|{ refresh_token }|204 No Content|Bearer token|
|GET|/api/v1/auth/me|—|200 UserResponse|Bearer token|



## **5.2 Módulo Productos** 

|**Método**|**Endpoint**|**Descripción**|**Rol**<br>**requerido**|**Response**|
|---|---|---|---|---|
|GET|/api/v1/productos|Listar (filtro:<br>categoria,<br>disponible, search,<br>page, size)|Público|200 PaginatedProductos|
|GET|/api/v1/productos/{id}|Detalle con<br>ingredientes,<br>categorías,<br>unidades y stock|Público|200 ProductoDetail|
|POST|/api/v1/productos|Crear producto con<br>imagenes_url[],<br>unidad_venta_id|ADMIN|201 ProductoRead|
|PUT|/api/v1/productos/{id}|Actualizar producto|ADMIN|200 ProductoRead|
|PATCH|/api/v1/productos/{id}/disponibilida<br>d|Cambiar disponible<br>(true/false)|ADMIN,<br>STOCK|200 ProductoRead|
|PATCH|/api/v1/productos/{id}/imagenes|Actualizar lista<br>imagenes_url[] del<br>producto|ADMIN|200 ProductoRead|
|DELETE|/api/v1/productos/{id}|Soft delete producto|ADMIN|204 No Content|
|GET|/api/v1/productos/{id}/ingredientes|Listar ingredientes<br>del producto|Público|200<br>List[IngredienteRead]|
|POST|/api/v1/productos/{id}/ingredientes|Asociar ingrediente<br>con cantidad y<br>unidad|ADMIN|201<br>ProductoIngredienteRead|



Programación 4 — TUP Página 10 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **5.3 Módulo Pedidos** 

|**Método**|**Endpoint**|**Descripción**|**Rol requerido**|**Response**|
|---|---|---|---|---|
|GET|/api/v1/pedidos|Listar propios<br>(CLIENT) o todos<br>(ADMIN/PEDIDOS)|CLIENT/ADMIN/PEDIDO<br>S|200<br>PaginatedPedidos|
|GET|/api/v1/pedidos/{id}|Detalle completo<br>con líneas,<br>trazabilidad y pago|Propietario/ADMIN|200 PedidoDetail|
|POST|/api/v1/pedidos|Crear pedido desde<br>carrito. Todo en una<br>transacción (UoW).|CLIENT|201 PedidoRead|
|PATCH|/api/v1/pedidos/{id}/estado|Avanzar estado.<br>Valida FSM. UoW<br>atómico. Notifica<br>WS post-commit.|ADMIN/PEDIDOS|200 PedidoRead|
|GET|/api/v1/pedidos/{id}/historial|Historial completo.<br>ORDER BY<br>created_at ASC.|Propietario/ADMIN|200<br>List[HistorialRead]|
|DELETE|/api/v1/pedidos/{id}|Cancelar propio<br>(solo PENDIENTE o<br>CONFIRMADO).|CLIENT propietario|200 PedidoRead|



## **5.4 Módulo Pagos (MercadoPago)** 

|**Método**|**Endpoint**|**Descripción**|**Rol requerido**|**Response**|
|---|---|---|---|---|
|POST|/api/v1/pagos/crear|Crea pago con token de tarjeta.<br>Registra en tabla Pago.|CLIENT|201<br>PagoRespons<br>e|
|POST|/api/v1/pagos/webhook|Endpoint IPN de MercadoPago.<br>Actualiza estado del pago y del<br>pedido. Notifica WS.|Público (validar<br>firma)|200 { status:<br>ok }|
|GET|/api/v1/pagos/{pedido_id}|Consulta el pago asociado a un<br>pedido.|Propietario/ADMI<br>N|200<br>PagoRespons<br>e|



## **5.5 Módulo Uploads — Cloudinary   (Nuevo v6.0)** 

|**Método**|**Endpoint**|**Descripción**|**Rol**<br>**requerido**|**Response**|
|---|---|---|---|---|
|POST|/api/v1/uploads/imagen|Sube una imagen a<br>Cloudinary. Recibe<br>multipart/form-data.<br>Devuelve secure_url y<br>public_id.|ADMIN|201<br>CloudinaryRespons<br>e|
|DELETE|/api/v1/uploads/imagen/{public_id<br>}|Elimina una imagen de<br>Cloudinary por su<br>public_id. Usar al borrar<br>producto o categoría.|ADMIN|204 No Content|



Programación 4 — TUP Página 11 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **6. Schemas de Request / Response (Pydantic v2)** 

Todos los schemas usan Pydantic v2. Se definen schemas separados para Create, Update y Read. Nunca se expone el model de SQLModel directamente como response. 

## **6.1 Auth** 

|**Schema**|**Campos requeridos**|**Validaciones**|
|---|---|---|
|LoginRequest|email: EmailStr, password: str|password mínimo 8 caracteres|
|RegisterRequest|nombre, apellido, email: EmailStr,<br>password: str|nombre/apellido min 2 max 80.<br>password min 8. Unicidad de email en<br>servicio.|
|TokenResponse|access_token, refresh_token, token_type,<br>expires_in: int|token_type = 'bearer'. expires_in en<br>segundos.|
|UserResponse|id, nombre, apellido, email, roles: list[str],<br>created_at|Nunca incluye password_hash.|



## **6.2 Pedidos** 

|**Schema**|**Campos**|**Validaciones / Notas**|
|---|---|---|
|CrearPedidoRequest|items: list[ItemPedidoRequest],<br>forma_pago_codigo: str, direccion_id:<br>int|None, notas: str|None|Mínimo 1 item. forma_pago_codigo<br>debe existir en catálogo.|
|ItemPedidoRequest|producto_id: int, cantidad: int,<br>personalizacion: list[int]|None|cantidad ≥ 1. personalizacion = IDs de<br>ingredientes removidos.|
|AvanzarEstadoRequest|nuevo_estado: str, motivo: str|None|motivo obligatorio si nuevo_estado =<br>CANCELADO (RN-05).|
|PedidoRead|id, estado_codigo, subtotal, descuento,<br>costo_envio, total, created_at|Versión compacta para listados.<br>Incluye subtotal y descuento (v7).|
|PedidoDetail|id, estado_codigo, subtotal, descuento,<br>costo_envio, total, items, historial, pago|Versión completa para vista de detalle.|
|DetallePedidoRead|producto_id, nombre_snapshot,<br>precio_snapshot, subtotal_snap,<br>cantidad, personalizacion|Snapshot inmutable. subtotal_snap<br>nuevo en v7.|



## **6.3 Cloudinary** 

|**Schema**|**Campos**|**Notas**|
|---|---|---|
|CloudinaryResponse|secure_url: str, public_id: str, width: int,<br>height: int, format: str, resource_type: str|Respuesta del upload. secure_url se<br>almacena en imagenes_url[] de<br>Producto o imagen_url de Categoria.|
|ImagenProductoUpdate|imagenes_url: list[str]|Lista completa de URLs. Reemplaza el<br>array anterior.|
|ImagenCategoriaUpdate|imagen_url: str | None|URL única de Cloudinary para la<br>categoría.|



Programación 4 — TUP Página 12 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **7. Patrón Unit of Work (UoW)** 

El Unit of Work actúa como director de orquesta que garantiza que todas las operaciones de base de datos dentro de una transacción de negocio tengan éxito o fallen como un conjunto. El commit ocurre en el UoW, no en el service. Las notificaciones WebSocket se emiten DESPUÉS del commit exitoso, fuera del bloque UoW. 

## **7.1 Flujo de una Operación con UoW — Crear Pedido** 

_Figura 4 — Flujo de creación de pedido con Unit of Work. Todos los INSERT son atómicos._ 

|**Paso**|**Capa**|**Operación**|**¿Toca BD?**|
|---|---|---|---|
|1|Router|Recibe POST /api/v1/pedidos. Valida body con<br>CrearPedidoRequest.|No|
|2|Router|Abre contexto: with UnitOfWork() as uow: — llama<br>service.crear_pedido(uow, body, usuario_id).|No|
|3|Service|Itera items. Para cada uno: uow.productos.get_by_id(). Verifica<br>disponible = true.|Lectura|
|4|Service|Calcula subtotal, descuento (si aplica) y total = subtotal -<br>descuento + costo_envio.|No|
|5|Service|Llama uow.pedidos.create(pedido). uow.flush() → obtiene<br>pedido.id.|INSERT + flush|
|6|Service|Crea DetallePedido por cada item con nombre_snapshot,<br>precio_snapshot, subtotal_snap.|INSERT × N|
|7|Service|Crea primer HistorialEstadoPedido con estado_desde=None<br>(RN-02).|INSERT|
|8|UoW|__exit__ sin excepción → session.commit(). Todo persiste<br>atómicamente.|COMMIT|
|9|Router|Serializa pedido con PedidoRead.model_validate(pedido). Retorna<br>HTTP 201.|No|
|ERR|UoW|Si cualquier paso 3-7 lanza excepción → __exit__ llama rollback().<br>Nada persiste.|ROLLBACK|



## **7.2 Flujo Avanzar Estado con WebSocket** 

_Figura 5 — Flujo de avanzar_estado con UoW + notificación WebSocket post-commit._ 

|**Paso**|**Capa**|**Operación**|**¿Toca BD/WS?**|
|---|---|---|---|
|1|Router|Recibe PATCH /pedidos/{id}/estado. Valida<br>AvanzarEstadoRequest.|No|
|2|Service|Dentro de with UoW() as uow: — obtiene pedido, valida FSM.|Lectura|
|3|Service|UPDATE Pedido.estado_codigo = nuevo_estado.|UPDATE|
|4|Service|INSERT HistorialEstadoPedido con estado_desde,<br>estado_hacia, usuario_id, motivo.|INSERT|
|5|UoW|__exit__ sin excepción → session.commit(). Cambio de estado<br>persiste.|COMMIT|
|6|Service|FUERA del bloque UoW: await<br>ws_manager.broadcast_pedido(pedido_id, evento)|WebSocket|



Programación 4 — TUP Página 13 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

|7|WSManager|Itera conexiones activas para pedido_id y canal<br>/ws/admin/pedidos. Envía JSON.|WS Send|
|---|---|---|---|
|8|Router|Serializa PedidoRead y retorna HTTP 200.|No|



## **7.3 BaseRepository[T] Genérico** 

|**Método**|**Descripción**|
|---|---|
|get_by_id(entity_id: int) → T | None|Obtiene entidad por clave primaria. Retorna None si no existe.|
|list_all(skip: int, limit: int) → list[T]|Listado simple sin filtros.|
|count() → int|Cantidad total de registros. Útil para paginación.|
|create(entity: T) → T|Agrega a sesión + flush() + refresh(). Retorna entidad con ID asignado.|
|update(entity: T) → T|Agrega entidad modificada a sesión + flush() + refresh().|
|soft_delete(entity: T) → None|Asigna deleted_at = now(). Solo para entidades con soft-delete.|
|hard_delete(entity: T) → None|Hard delete. Solo se usa cuando el modelo no tiene soft-delete.|



## **8. Integración MercadoPago** 

Food Store integra MercadoPago Checkout PRO. Permite procesar pagos con tarjeta de crédito/débito, Rapipago, Pago Fácil y Cuenta MercadoPago sin redirigir al cliente fuera del sitio. 

¿Por qué Checkout PRO con Orders? - Única integración para múltiples medios de pago. - Datos de tarjeta tokenizados por MercadoPago.js — NUNCA pasan por el servidor de Food Store (PCI SAQ-A). - Notificaciones push (webhook) para confirmación asíncrona del pago. - idempotency_key UUID generado por el backend evita cobros duplicados por reintento. 

## **9. WebSocket — Notificaciones en Tiempo Real** 

Food Store utiliza WebSocket nativo de FastAPI para mostrar a los clientes y administradores cuando el estado de un pedido cambia. Esto reemplaza el polling periódico y mejora la experiencia de usuario al mostrar actualizaciones instantáneas en la pantalla de seguimiento del pedido y en el panel de administración. 

## **9.1 Arquitectura WebSocket** 

_Figura 7 — Arquitectura WebSocket: WSManager en el core, canales de suscripción y flujo de broadcast._ 

Principios de diseño: 

- El WSManager es un singleton en app/core/ws_manager.py. Se inyecta en los servicios via FastAPI Depends7. 

- Autenticación via query param token=<jwt> en la URL del WebSocket. 

- El broadcast SIEMPRE ocurre DESPUÉS del commit() del UoW, nunca dentro del bloque transaccional. 

- Si no hay suscriptores, el broadcast es un no-op (silencioso). 

## **9.2 Endpoints WebSocket** 

|**Endpoint**|**Tipo**|**Descripción**|**Auth**|**Payload recibido**||
|---|---|---|---|---|---|
|WS /ws/pedidos|WebSocket|Feed de todos los<br>pedidos. Recibe todos los<br>cambios de estado.|JWT en ?token=<br>(ADMIN/PEDIDOS<br>)|JSON: { event,<br>pedido_id,<br>usuario_id,||



Programación 4 — TUP Página 14 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

**==> picture [375 x 39] intentionally omitted <==**

estado_nuevo, estado_anterior, timestamp } 

## **9.3 WSManager — Implementación Backend** 

|**Método**|**Descripción**|
|---|---|
|connect(ws, pedido_id | 'admin')|Registra una conexión WebSocket en el pool bajo el canal dado.|
|disconnect(ws, pedido_id | 'admin')|Elimina la conexión del pool. Se llama en el bloque finally del endpoint<br>WS.|
|broadcast_pedido(pedido_id,<br>evento)|Envía JSON al cliente dueño del pedido y al canal admin. Captura errores<br>de conexiones caídas.|
|broadcast_to_role(rol, evento)|Envía JSON a la room del rol.|



## **9.4 Estructura del Evento WebSocket** 

|**Campo**|**Tipo**|**Descripción**|
|---|---|---|
|event|str|Tipo de evento. Valores: 'estado_cambiado' | 'pedido_cancelado' |<br>'pago_confirmado'|
|pedido_id|int|ID del pedido afectado|
|estado_anterior|str | null|Código del estado previo. null en creación inicial.|
|estado_nuevo|str|Código del nuevo estado (ej: 'CONFIRMADO', 'EN_PREP',<br>'ENTREGADO')|
|usuario_id|int | null|ID del usuario que realizó la acción. null si fue el sistema<br>(webhook MP).|
|motivo|str | null|Motivo de cancelación si aplica (RN-05).|
|timestamp|str|ISO 8601 UTC. Ej: '2025-08-12T14:30:00Z'|



## **9.5 Implementación Frontend** 

El hook useOrderStatusWS encapsula toda la lógica de conexión WebSocket y expone un estado reactivo. 

|**Elemento**|**Archivo**|**Descripción**|
|---|---|---|
|useOrderStatusWS|hooks/useOrderStatus.ts|Hook personalizado. Conecta al WS,<br>gestiona reconexión exponencial, actualiza<br>Zustand y React Query.|



Programación 4 — TUP Página 15 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **9.6 Reconexión y Resiliencia** 

|**Escenario**|**Estrategia**|
|---|---|
|Token expirado|El hook detecta error 4001 (close code) y llama al interceptor de refresh<br>antes de reconectar.|
|Servidor caído|Intentos máximos configurables (default 10). Muestra badge 'Sin conexión<br>en tiempo real' en UI.|
|Datos desincronizados|Al reconectar, el frontend llama GET /api/v1/pedidos/{id} para obtener el<br>estado actual del servidor.|



## **10. Cloudinary — Gestión de Imágenes** 

Food Store utiliza Cloudinary para almacenar, transformar y servir imágenes de productos y categorías. Las imágenes se suben al backend vía el módulo /uploads, que las envía a Cloudinary y devuelve la URL segura para almacenar en la base de datos. 

¿Por qué Cloudinary? 

- CDN global con transformaciones on-the-fly (resize, crop, formato WebP automático). 

- Eliminación de imágenes por public_id sin depender de la URL completa. 

- URL firmada disponible para contenido privado si se requiere en el futuro. 

- Modo de subida: BACKEND (signed upload con API key/secret). No se expone el secret al frontend. 

## **10.1 Flujo de Subida de Imagen** 

_Figura 8 — Flujo completo de upload de imagen vía el módulo /uploads al backend Cloudinary._ 

|**Paso**|**Actor**|**Acción**|**Resultado**|
|---|---|---|---|
|1|Admin|Selecciona imagen en el formulario de producto<br>o categoría.|Archivo disponible en el<br>componente React.|
|2|Frontend|POST /api/v1/uploads/imagen con<br>multipart/form-data (field: file, folder: 'productos').|Request autenticado con JWT.|
|3|Backend<br>(Router)|Valida tipo MIME (image/jpeg, image/png,<br>image/webp) y tamaño (max 5 MB).|HTTP 400 si inválido.|
|4|Backend<br>(Service)|Llama cloudinary.uploader.upload(file_bytes,<br>folder='foodstore/productos').|Imagen almacenada en<br>Cloudinary.|
|5|Cloudinary|Retorna objeto con secure_url, public_id, width,<br>height, format.|Respuesta JSON con<br>metadatos.|
|6|Backend|Serializa CloudinaryResponse y retorna HTTP<br>201.|secure_url y public_id<br>disponibles.|
|7|Frontend|Agrega secure_url al array imagenes_url del<br>formulario de producto.|URL lista para guardar con el<br>producto.|
|8|Admin|Guarda el producto. PUT /api/v1/productos/{id}<br>con imagenes_url actualizado.|Producto guardado con imagen<br>en BD.|



Programación 4 — TUP Página 16 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **10.2 Flujo de Eliminación de Imagen** 

|**Paso**|**Actor**|**Acción**|**Resultado**|
|---|---|---|---|
|1|Admin|Hace clic en eliminar imagen de un producto.|Frontend conoce el public_id de la<br>imagen.|
|2|Frontend|DELETE /api/v1/uploads/imagen/{public_id} (URL<br>encode del public_id).|Request autenticado con JWT.|
|3|Backend|Llama cloudinary.uploader.destroy(public_id).|Imagen eliminada de Cloudinary<br>CDN.|
|4|Backend|Retorna HTTP 204 No Content.|Confirmación de eliminación.|
|5|Frontend|Actualiza imagenes_url[] del producto (quita la<br>URL eliminada). PATCH<br>/api/v1/productos/{id}/imagenes.|Imagen eliminada de BD y CDN.|



## **10.3 Configuración Backend (cloudinary SDK)** 

|**Configuración**|**Descripción**|
|---|---|
|cloudinary.config(cloud_name,<br>api_key, api_secret)|Inicializado en app/core/config.py al arrancar la app.|
|allowed_formats|['jpg', 'jpeg', 'png', 'webp'] — rechaza formatos no soportados desde el SDK.|
|overwrite=False|Evita sobrescribir imágenes existentes con el mismo public_id.|
|unique_filename=True|Cloudinary genera un public_id único si no se especifica uno.|
|resource_type='image'|Solo se aceptan imágenes (no videos ni raw files).|



Programación 4 — TUP Página 17 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **11. Gestión de Estado con Zustand** 

Zustand es la librería de gestión de estado global del frontend. Food Store v6.0 requiere cinco stores con responsabilidades claramente separadas, incluyendo el nuevo wsStore para gestionar el estado de las conexiones WebSocket. 

_Figura 9 — Los cinco stores Zustand y sus responsabilidades. Persistencia selectiva por store._ 

|**Store**|**Archivo**|**Estado que gestiona**|**Middlewar**<br>**e**|**Persiste**|
|---|---|---|---|---|
|authStore|store/authStore.ts|accessToken, usuario,<br>isAuthenticated|persist|Sí — solo el<br>accessToken|
|cartStore|store/cartStore.ts|items del carrito, cantidades,<br>personalizaciones|persist|Sí — items<br>completos|



Buenas prácticas de consumo de stores: - Suscripción por slice: const itemCount = useCartStore(s => s.itemCount()) — evita re-renders innecesarios. - Actions extraídas sin re-render: const { addItem } = useCartStore() - Nunca suscribirse al store completo sin selector: ❌ const store = useCartStore() - Acceso fuera de React (interceptores): useAuthStore.getState().accessToken - wsStore: las actions connect() y disconnect() son llamadas solo por los hooks useOrderStatusWS y useAdminOrdersFeed. - wsStore nunca es accedido por componentes directamente — solo a través de los hooks WS. 

Programación 4 — TUP Página 18 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **12. Configuración y Setup** 

## **12.1 Variables de Entorno** 

|**Variable**|**Descripción**|**Valor ejemplo**|
|---|---|---|
|DATABASE_URL|Conexión a<br>PostgreSQL|postgresql://user:pass@localhost:5432/foodstore_d<br>b|
|SECRET_KEY|Clave secreta<br>para firmar JWT<br>(mín. 32 chars)|your-super-secret-key-min-32-chars|
|ALGORITHM|Algoritmo JWT|HS256|
|ACCESS_TOKEN_EXPIRE_MINUTES|Expiración del<br>access token en<br>minutos|30|
|REFRESH_TOKEN_EXPIRE_DAYS|Expiración del<br>refresh token en<br>días|7|
|CORS_ORIGINS|Orígenes<br>permitidos<br>(JSON array)|["http://localhost:5173"]|
|MP_ACCESS_TOKEN|Access Token de<br>MercadoPago<br>(backend)|TEST-xxxx|
|MP_PUBLIC_KEY|Public Key de<br>MercadoPago<br>(para el<br>frontend)|TEST-xxxx|
|MP_NOTIFICATION_URL|URL del<br>webhook IPN de<br>MercadoPago|https://dominio-ngrok.com/api/v1/pagos/webhook|
|CLOUDINARY_CLOUD_NAME|Cloud name de<br>la cuenta<br>Cloudinary|mi-cloud-name|
|CLOUDINARY_API_KEY|API Key de<br>Cloudinary<br>(backend only,<br>no exponer)|123456789012345|
|CLOUDINARY_API_SECRET|API Secret de<br>Cloudinary<br>(backend only,<br>secreto)|abcdefghijklmn|
|VITE_API_URL|URL base del<br>backend (Vite —<br>frontend)|http://localhost:8000|



Programación 4 — TUP Página 19 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **12.2 Seed Data Obligatorio — app/db/seed.py** 

|**Entidad**|**Registros a insertar**|
|---|---|
|Rol|ADMIN, STOCK, PEDIDOS, CLIENT — los cuatro roles del sistema RBAC|
|EstadoPedido|PENDIENTE, CONFIRMADO, EN_PREP, ENTREGADO, CANCELADO — con<br>es_terminal correspondiente (5 estados)|
|FormaPago|MERCADOPAGO (habilitado), EFECTIVO (habilitado), TRANSFERENCIA<br>(habilitado)|
|UnidadMedida|kg (peso), g (peso), L (volumen), ml (volumen), ud (contable), porciones (contable)|
|Usuario admin|admin@foodstore.com / Admin1234! — con rol ADMIN asignado. Contraseña debe<br>cambiarse en producción.|



Programación 4 — TUP Página 20 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **13. Patrones Aplicados en el Proyecto** 

|**Patrón**|**Capa**|**Descripción**|
|---|---|---|
|Repository Pattern|Backend|Abstracción del acceso a BD. BaseRepository[T] genérico.<br>Facilita testing con mocks.|
|Unit of Work|Backend|Gestión de transacciones atómicas. El Service opera dentro<br>del contexto UoW sin gestionar la sesión directamente.|
|Service Layer|Backend|Lógica de negocio centralizada, stateless. Consume el UoW.<br>Independiente del framework.|
|Snapshot Pattern|Backend/BD|Precios y nombres de producto inmutables al crear el pedido.<br>Garantiza integridad histórica.|
|Soft Delete|Backend/BD|deleted_at TIMESTAMPTZ — registros lógicamente<br>eliminados. Nunca DELETE físico en entidades de negocio.|
|Audit Trail Append-Only|Backend/BD|HistorialEstadoPedido: solo INSERT, nunca<br>UPDATE/DELETE (RN-03). Trazabilidad completa.|
|State Machine (FSM)|Backend|Transiciones del pedido validadas en la capa de servicio<br>contra el mapa de transiciones permitidas.|
|Idempotent Payments|Backend|UUID como idempotency_key enviado a MercadoPago. Evita<br>cobros duplicados por reintentos.|
|Connection Pool|Backend|WSManager mantiene un pool de WebSocket activos por<br>canal. Limpia conexiones cerradas automáticamente.|
|CDN Upload|Backend/Frontend|Imágenes subidas a Cloudinary (CDN global). Backend<br>gestiona el upload signed. Frontend usa las URLs servidas<br>por CDN.|
|Feature-Sliced Design|Frontend|Organización por features con límites de importación claros.<br>Cada feature es autocontenida.|
|Custom Hooks|Frontend|Encapsulan lógica de TanStack Query y WebSocket en<br>hooks reutilizables por dominio.|
|Optimistic Updates|Frontend|Actualización inmediata de UI antes de confirmar respuesta<br>del servidor. Rollback en error.|
|Webhook|Backend|MercadoPago notifica de forma asíncrona el resultado del<br>pago. Evita polling constante.|



Programación 4 — TUP Página 21 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **14. Rúbrica de Corrección — v6.0** 

Puntaje total: 240 puntos. Corrección escrita + video de demostración obligatorio. 

|**Criterio**|**Pt**<br>**s**|**Excelente**|**Bueno**|**Regular**|**Insuficiente**|
|---|---|---|---|---|---|
|Backend —<br>Estructura y<br>Configuración|10|Capas router/service/uow/repository/model.<br>Módulos por dominio. core/ separado. seed.<br>CORS + rate limiting.|Separación<br>parcial. Seed<br>incompleto.|Estructura<br>plana o sin<br>capas.|Sin estructura<br>reconocible.|
|Backend —<br>Modelo de<br>Datos (ERD<br>v7)|15|SQLModel correcto, constraints, soft-delete,<br>snapshot, entidades completas<br>(UnidadMedida, Ingrediente, Pago completo).<br>subtotal+descuento en Pedido.|Correctos,<br>faltan algunas<br>entidades v7.|Básicos sin<br>patrones<br>avanzados.|Incorrectos o<br>incompletos.|
|Backend —<br>Unit of Work y<br>Repository|15|UoW completo con context manager,<br>commit/rollback automático.<br>BaseRepository[T] genérico. Ningún service<br>hace session.commit(). WS broadcast fuera<br>del UoW.|UoW presente<br>pero<br>incompleto o<br>WS dentro del<br>bloque.|Sin UoW,<br>transaccione<br>s manuales.|Sin gestión de<br>transacciones.|
|Backend —<br>Capa de<br>Servicio|15|FSM 5 estados implementada.<br>RN-01/02/03/05/06 validadas. Services<br>stateless. avanzar_estado() emite broadcast<br>WS post-commit.|Lógica<br>presente pero<br>RN-06 faltante.|Lógica<br>básica sin<br>validaciones.|Sin capa de<br>servicio.|
|Backend —<br>Controladores<br>REST|15|Verbos HTTP correctos, rutas semánticas,<br>status codes precisos. Prefijo /api/v1.<br>Schemas Pydantic separados.|Verbos y rutas<br>correctas,<br>algunos status<br>codes<br>incorrectos.|Verbos<br>incorrectos o<br>rutas no<br>semánticas.|Sin<br>convenciones<br>REST.|
|Backend —<br>MercadoPago|15|SDK Python con idempotency_key UUID.<br>Webhook que procesa topic=payment. Tabla<br>Pago completa (mp_status_detail,<br>transaction_amount).|SDK<br>configurado, sin<br>idempotency_k<br>ey|Integración<br>parcial.|Sin<br>integración<br>MP.|
|Backend —<br>WebSocket|20|WSManager con pool, broadcast por canal,<br>autenticación JWT en handshake, broadcast<br>post-commit.|WSManager<br>presente, sin<br>canal admin o<br>sin auth.|WS básico<br>sin pool ni<br>reconexión.|Sin<br>WebSocket.|
|Backend —<br>Cloudinary|15|Módulo /uploads completo: upload (validar<br>MIME + tamaño), destroy por public_id. SDK<br>configurado. imagenes_url[] en Producto,<br>imagen_url en Categoria.|Upload<br>funcional, sin<br>destroy o sin<br>validación.|Upload<br>básico sin<br>integración<br>al modelo.|Sin<br>Cloudinary.|
|Frontend —<br>Estructura y<br>TypeScript|10|Feature-sliced:<br>pages/features/components/hooks/store/api/t<br>ypes. Sin cross-imports. strict: true, no any.|Estructura<br>presente,<br>algunos<br>módulos<br>mezclados.|Estructura<br>plana.|Sin estructura.|
|Frontend —<br>Zustand|10|stores implementados y tipados. persist<br>correcto.|4 stores<br>correctos,<br>wsStore<br>faltante.|Solo<br>authStore y<br>cartStore<br>básicos.|Sin Zustand.|
|Frontend —<br>TanStack<br>Query|15|useQuery/useMutation para todo el fetch.<br>queryKeys descriptivos. Invalidación tras<br>mutaciones. Interceptor refresh 401<br>automático. Invalidación en eventos WS.|TanStack<br>Query<br>presente,<br>invalidación<br>parcial o sin<br>WS.|Fetch directo<br>con<br>useEffect.|Sin TanStack<br>Query.|



Programación 4 — TUP Página 22 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

|Frontend —<br>WebSocket|20|useOrderStatusWS implementado.|Hooks WS<br>presentes, sin<br>reconexión o<br>sin admin feed.|WS básico<br>sin hook<br>reutilizable.|Sin<br>WebSocket<br>frontend.|
|---|---|---|---|---|---|
|Frontend —<br>Funcionalidad<br>es Cliente|15|Catálogo, Carrito persist. Checkout con<br>CardPayment de MP. Timeline WS en tiempo<br>real.|Funcional con<br>algunas<br>carencias.|Lista sin<br>filtros ni<br>paginación.|Sin<br>funcionalidade<br>s.|
|Frontend —<br>Panel Admin|15|Dashboard estadísticas. CRUD<br>categorías/productos con upload Cloudinary.<br>Gestión pedidos con FSM y feed WS. Gestión<br>stock.|CRUD<br>funcional, falta<br>alguna feature.|Solo<br>visualización<br>.|Sin panel<br>admin.|
|UI/UX y<br>Diseño|10|Sistema de diseño consistente. Mobile-first.<br>Skeleton loaders, toasts, modales, badge de<br>conexión WS en tiempo real, estados vacíos.|Diseño<br>consistente con<br>pequeñas<br>inconsistencias.|Diseño<br>básico sin<br>sistema.|Sin diseño<br>coherente.|
|Calidad de<br>Código|10|snake_case/camelCase/PascalCase.<br>Funciones < 50 líneas. SRP. Docstrings.<br>README.md completo.|Nomenclatura<br>correcta,<br>algunas<br>funciones<br>largas.|Mezcla de<br>convencione<br>s.|Sin<br>convenciones.|



Escala de calificación: 217-240 pts (90-100%) — EXCELENTE: Proyecto completo, profesional, con todas las capas y buenas prácticas. 169-216 pts (70-89%)  — BUENO: Proyecto funcional con pequeños ajustes o funcionalidades faltantes. 121-168 pts (50-69%)  — REGULAR: Proyecto básico con errores o funcionalidades incompletas. 0-120 pts  (0-49%)   — INSUFICIENTE: Proyecto incompleto, no funcional o no sigue la especificación.  Bonus +10 pts: Tests unitarios con pytest, cobertura > 60% (test_pedidos, test_pagos, test_auth). Penalización -30%: El proyecto que no corra localmente siguiendo el README. 

Programación 4 — TUP Página 23 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **15. Entrega del Proyecto** 

## **15.1 Checklist de Entrega** 

|**Ítem**|**Descripción**|**Estado**|
|---|---|---|
|CE-01|Link a repositorios GitHub público en la entrega|☐Pendiente|
|CE-02|README.md con instrucciones de setup funcionando en máquina limpia|☐Pendiente|
|CE-03|.env.example completo con variables de MercadoPago, Cloudinary y WebSocket<br>documentadas|☐Pendiente|
|CE-05|python -m app.db.seed ejecuta correctamente y carga datos iniciales (incluye<br>UnidadMedida)|☐Pendiente|
|CE-06|pnpm i + pnpm dev|☐Pendiente|
|CE-07|pip install -r requirements.txt + uvicorn app.main:app sin errores|☐Pendiente|
|CE-08|Swagger UI (/docs) accesible con todos los endpoints documentados (incluye<br>/uploads)|☐Pendiente|
|CE-09|Pago de prueba con tarjeta sandbox MP funciona end-to-end y notifica vía WS|☐Pendiente|
|CE-10|Unit of Work correctamente implementado (ningún service.session.commit()<br>directo)|☐Pendiente|
|CE-11|5 Zustand stores implementados, tipados y con persist correcto (incluye<br>wsStore)|☐Pendiente|
|CE-12|WebSocket: cambio de estado desde panel admin actualiza UI del cliente sin<br>recargar|☐Pendiente|
|CE-13|Cloudinary: subir imagen de producto desde panel admin y verla en el catálogo|☐Pendiente|
|CE-15|Link a video demostración (10-15 min) en README (demostrar WS y Cloudinary<br>en vivo)|☐Pendiente|
|CE-16|Repositorio público verificado con sesión cerrada|☐Pendiente|



Programación 4 — TUP Página 24 

🍔 Food Store — Especificación Técnica v6.0  ·    ERD v7 

## **Apéndice — Referencias y Recursos** 

|**Tecnología**|**URL**|
|---|---|
|FastAPI|https://fastapi.tiangolo.com|
|FastAPI WebSockets|https://fastapi.tiangolo.com/advanced/websockets/|
|SQLModel|https://sqlmodel.tiangolo.com|
|Pydantic v2|https://docs.pydantic.dev|
|TanStack Query v5|https://tanstack.com/query|
|TanStack Form|https://tanstack.com/form|
|Zustand|https://zustand-demo.pmnd.rs|
|Tailwind CSS|https://tailwindcss.com/docs|
|recharts|https://recharts.org|
|MercadoPago Developers (AR)|https://www.mercadopago.com.ar/developers/es|
|MercadoPago SDK Python|https://github.com/mercadopago/sdk-python|
|MercadoPago SDK React|https://github.com/mercadopago/sdk-react|
|Cloudinary Docs|https://cloudinary.com/documentation|
|Cloudinary Python SDK|https://cloudinary.com/documentation/python_integration|
|Cloudinary React SDK|https://cloudinary.com/documentation/react_integration|
|Cloudinary Transformations|https://cloudinary.com/documentation/transformation_reference|



Programación 4 — TUP Página 25 

