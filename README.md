# The Food Store

## Carátula del Proyecto

**Grupo:** Geminianos

**Integrantes:**

- Lautaro Salinas
- Facundo Bront
- Ignacio Gomez
- Franco Mellimaci

**Video de explicación del backend:**

[Ver video en Google Drive](https://drive.google.com/drive/folders/1oKThW0sBriSE-Z1bm6Al7ZpUczYEWy0D?usp=sharing)

**Video Integrador Final (10-15 min):**

[Ver video en Google Drive](https://drive.google.com/drive/folders/1AD15_qWEuXFkNjyHWViJ2Cr98yQHWmNp?usp=sharing)

---

Proyecto desarrollado para la materia Programación IV.

El backend del sistema fue construido con FastAPI, SQLAlchemy y Pydantic para exponer la lógica principal de la aplicación.

---

## Descripción General

**The Food Store** es una aplicación web full-stack para la gestión integral de un negocio de comidas. Permite a los clientes explorar el catálogo, agregar productos al carrito, realizar pedidos con pago integrado vía MercadoPago y hacer seguimiento en tiempo real del estado de su pedido mediante WebSocket. Los administradores gestionan el catálogo (con imágenes en Cloudinary), el stock, los pedidos y los usuarios desde un panel centralizado.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Backend | FastAPI | 0.110.1 |
| Backend | SQLModel + SQLAlchemy | 0.0.16 + 2.0.29 |
| Backend | Uvicorn | 0.29.0 |
| Backend | PostgreSQL | 15+ |
| Backend | Cloudinary SDK | 1.40.0 |
| Backend | SlowAPI (rate limiting) | 0.1.9 |
| Frontend | React + TypeScript | 18.x + 5.x |
| Frontend | Vite | 5.x |
| Frontend | Zustand | 5.x |
| Frontend | TanStack Query | 5.x |
| Frontend | Recharts | 2.x |
| Frontend | Tailwind CSS + shadcn/ui | 3.x |
| Pagos | MercadoPago Checkout PRO | — |
| Imágenes | Cloudinary CDN | — |

---

## Requisitos Previos

Antes de comenzar, asegurate de tener instalado:

- **Python 3.11+**
- **Node.js 18+** y **pnpm** (`npm install -g pnpm`)
- **PostgreSQL 15+** corriendo localmente (o Docker)
- Una cuenta en **Cloudinary** (gratuita)
- Una cuenta de **MercadoPago Developers** con credenciales de prueba

---

## Estructura del Proyecto

```
TI-Magni-Espejo/
├── backend/
│   ├── main.py                  # Entry point FastAPI
│   ├── requirements.txt
│   ├── .env                     # Variables de entorno (no commitear)
│   └── app/
│       ├── core/                # Config, DB, seguridad, middleware, WS
│       ├── db/                  # seed.py con datos iniciales
│       └── modules/             # Módulos por dominio
│           ├── auth/
│           ├── usuarios/
│           ├── categorias/
│           ├── productos/
│           ├── ingredientes/
│           ├── pedidos/         # Router HTTP + ws_router WebSocket
│           ├── pagos/
│           ├── direcciones/
│           ├── estadisticas/
│           ├── uploads/
│           └── admin/
├── frontend/
│   ├── src/
│   │   ├── features/            # Módulos por feature (Feature-Sliced Design)
│   │   ├── pages/               # Páginas enrutadas
│   │   ├── store/               # Zustand stores (auth, cart, ws, payment, orderStatus)
│   │   ├── hooks/               # Hooks reutilizables (WS, auth, etc.)
│   │   └── shared/              # API client, tipos comunes
│   └── package.json
└── README.md
```

---

## Configuración del Backend

### 1. Crear el entorno virtual e instalar dependencias

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Creá un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
APP_NAME="The Food Store API"
APP_VERSION="2.0.0"
ENVIRONMENT="development"

# Base de datos PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/food_store"

# CORS — origen del frontend
FRONTEND_ORIGIN="http://localhost:5173"

# JWT
JWT_SECRET_KEY="cambia-esto-por-una-clave-segura-de-minimo-32-caracteres"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Usuario admin inicial (creado por el seed)
ADMIN_EMAIL="admin@thefoodstore.com"
ADMIN_PASSWORD="admin"

# MercadoPago (obtené tus credenciales en https://www.mercadopago.com.ar/developers)
MP_ACCESS_TOKEN="TEST-xxxxxxxxxxxxxxxxxxxx"
MP_WEBHOOK_SECRET="TEST_WEBHOOK_SECRET"

# Cloudinary (obtené tus credenciales en https://console.cloudinary.com)
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

> **Importante:** Nunca subas el `.env` real al repositorio. Usá `.env.example` como referencia.

### 3. Crear la base de datos

```bash
# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE food_store;"
```

### 4. Ejecutar las migraciones y el seed

```bash
# Desde la carpeta backend/, con el venv activado
python -m app.db.seed
```

Esto crea todas las tablas y carga los datos iniciales obligatorios:
- Roles: `ADMIN`, `STOCK`, `PEDIDOS`, `CLIENT`
- Estados de pedido: `PENDIENTE`, `CONFIRMADO`, `EN_PREP`, `ENTREGADO`, `CANCELADO`
- Formas de pago: `MERCADOPAGO`, `EFECTIVO`, `TRANSFERENCIA`
- Unidades de medida: `kg`, `g`, `L`, `ml`, `ud`, `porciones`
- Categorías, ingredientes y productos de ejemplo
- Usuario administrador: `admin@thefoodstore.com` / `admin`

### 5. Iniciar el servidor

```bash
# Desde la raíz del proyecto o desde backend/
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

La API queda disponible en:
- **REST API:** `http://localhost:8000/api/v1`
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **WebSocket:** `ws://localhost:8000/ws/pedidos`

---

## Configuración del Frontend

### 1. Instalar dependencias

```bash
cd frontend
pnpm install
```

### 2. Variables de entorno del frontend

Creá un archivo `.env` en la carpeta `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

El frontend queda disponible en `http://localhost:5173`.

---

## Levantar todo con Docker (alternativa)

Si tenés Docker instalado, podés levantar PostgreSQL fácilmente:

```bash
docker run --name food-store-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=food_store \
  -p 5432:5432 \
  -d postgres:15
```

Luego seguí los pasos del backend normalmente (seed + uvicorn).

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@thefoodstore.com | admin |
| Cliente | (registrarse desde el frontend) | — |

### Tarjeta de prueba MercadoPago (sandbox)

| Campo | Valor |
|---|---|
| Número | `4509 9535 6623 3704` |
| Vencimiento | Cualquier fecha futura |
| CVV | `123` |
| Nombre | Cualquier nombre |

---

## Funcionalidades Principales

### Para el Cliente
- Registro e inicio de sesión con JWT
- Exploración del catálogo con búsqueda, filtros por categoría y paginación
- Carrito de compras persistente (Zustand + localStorage)
- Checkout con pago vía MercadoPago Checkout PRO
- Seguimiento del pedido en **tiempo real** vía WebSocket (sin recargar la página)
- Gestión de direcciones de entrega
- Historial de pedidos en el perfil

### Para el Administrador
- Panel centralizado con KPIs y gráficos (Recharts)
- CRUD completo de categorías y productos
- Upload de imágenes a Cloudinary desde el formulario
- Gestión de pedidos con avance de estados (FSM: PENDIENTE → CONFIRMADO → EN_PREP → ENTREGADO)
- Módulo de estadísticas: ventas, ingresos, productos top, pedidos por estado
- Gestión de usuarios e ingredientes/stock

---

## Arquitectura Backend

El backend implementa los siguientes patrones:

- **Repository Pattern** — `BaseRepository[T]` genérico por dominio
- **Unit of Work** — transacciones atómicas con context manager; ningún service hace `session.commit()` directo
- **Service Layer** — lógica de negocio stateless, independiente del framework
- **FSM (Finite State Machine)** — transiciones de estado del pedido validadas en el service
- **Snapshot Pattern** — precio y nombre del producto se capturan al crear el pedido
- **Soft Delete** — campo `deleted_at`, nunca DELETE físico en entidades de negocio
- **Audit Trail Append-Only** — `HistorialEstadoPedido`: solo INSERT, nunca UPDATE/DELETE
- **WebSocket Manager** — pool de conexiones por sala, broadcast post-commit

---

## Arquitectura Frontend

- **Feature-Sliced Design** — `pages/features/components/hooks/store/shared`
- **5 Zustand stores** — `authStore`, `cartStore`, `wsStore`, `paymentStore`, `orderStatusStore`
- **TanStack Query** — todo el fetching via `useQuery`/`useMutation` con invalidación automática
- **WebSocket hooks** — `useOrderStatusWS` (cliente) y `useAdminOrdersFeed` (admin) con reconexión exponencial

---

## Tests

Los tests se encuentran en `backend/tests/` y usan SQLite en memoria para aislamiento.

```bash
# Correr todos los tests
cd backend
pytest

# Con detalle y cobertura
pytest -v --tb=short

# Solo un módulo
pytest tests/test_auth.py -v
pytest tests/test_estadisticas.py -v
```

Módulos de test disponibles:
- `test_auth.py` — registro, login, logout, /me, rate limiting
- `test_estadisticas.py` — EST-01 a EST-05, acceso por roles

---

## Endpoints Principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/register` | Registro de usuario |
| POST | `/api/v1/auth/login` | Inicio de sesión |
| POST | `/api/v1/auth/logout` | Cierre de sesión |
| GET | `/api/v1/auth/me` | Perfil del usuario autenticado |
| GET | `/api/v1/productos/` | Listar productos (con filtros) |
| POST | `/api/v1/productos/` | Crear producto (ADMIN) |
| PUT | `/api/v1/productos/{id}` | Actualizar producto (ADMIN) |
| POST | `/api/v1/pedidos/` | Crear pedido |
| PATCH | `/api/v1/pedidos/{id}/estado` | Avanzar estado del pedido (ADMIN) |
| POST | `/api/v1/pagos/crear` | Iniciar pago con MercadoPago |
| POST | `/api/v1/pagos/webhook` | Webhook de MercadoPago |
| GET | `/api/v1/estadisticas/resumen` | KPIs generales (ADMIN) |
| POST | `/api/v1/uploads/` | Subir imagen a Cloudinary (ADMIN) |
| WS | `/ws/pedidos` | WebSocket en tiempo real |

Documentación completa en `http://localhost:8000/docs`.
