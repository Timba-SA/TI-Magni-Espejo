# The Food Store - Backend API

API REST construida con FastAPI, SQLAlchemy 2.0 y Pydantic v2 para proveer servicios a la aplicación frontend "The Food Store".

## Stack Tecnológico

- **Python 3.11+**
- **FastAPI** (Framework web moderno y rápido)
- **Uvicorn** (Servidor ASGI)
- **SQLAlchemy 2.0** (ORM)
- **Pydantic v2** (Validación de datos y schemas)
- **SQLite** (Base de datos de desarrollo inicial, preparada para migrar a PostgreSQL)

## Estructura del Proyecto

```
backend/
├── app/
│   ├── main.py                # Instancia principal y configuración
│   ├── core/                  # Configuración global y setup DB
│   ├── modules/               # Dominios de negocio (Auth, Insumos)
│   │   ├── auth/              # Router, validación de credenciales (mock)
│   │   └── insumos/           # CRUD completo (Router, Service, Repository, Models, Schemas)
│   └── shared/                # Utilidades y excepciones (si aplica)
├── scripts/
│   └── seed_db.py             # Script de carga de datos inicial
├── .env                       # Variables de entorno locales
├── requirements.txt           # Dependencias del proyecto
└── requests.http              # Archivo para testear endpoints
```

## Setup y Ejecución (Windows)

1. Abrir terminal en la carpeta `backend` y crear entorno virtual:
   ```bash
   python -m venv venv
   ```
2. Activar entorno virtual:
   ```bash
   venv\Scripts\activate
   ```
3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Configurar variables de entorno (copiar `.env.example` a `.env` si no existe).
5. Poblar la base de datos con datos de prueba iniciales:
   ```bash
   python scripts/seed_db.py
   ```
6. Levantar servidor local de desarrollo:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

## Documentación y Uso

- **API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Credenciales Demo
Para la validación del login, utilizar las siguientes credenciales (definidas internamente):
- **Usuario:** `admin` o `admin@thefoodstore.com`
- **Contraseña:** `admin123`

## Futuras Integraciones (PostgreSQL y JWT)

- **PostgreSQL:** Cambiar la variable `DATABASE_URL` en el archivo `.env` por la cadena de conexión de postgres (ej: `postgresql://user:pass@localhost:5432/foodstore`).
- **JWT:** La estructura modular (`auth`) permite agregar generación de tokens y un middleware global fácilmente modificando `auth/service.py` y agregando un dependency en `insumos/router.py` sin reescribir toda la aplicación.
