from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.database import create_db_and_tables
from app.core.middleware import limiter
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.ingredientes.router import router as ingredientes_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.direcciones.router import router as direcciones_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.pagos.router import router as pagos_router
from app.modules.admin.router import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="The Food Store API",
    version="2.0.0",
    description="API REST del sistema de gestión de pedidos The Food Store.",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://localhost:5173",
        "https://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rate limiting global
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Dominio 1 - Identidad & Acceso
app.include_router(auth_router, prefix="/api/v1")
app.include_router(usuarios_router, prefix="/api/v1")
app.include_router(direcciones_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

# Dominio 2 - Catálogo de Productos
app.include_router(categorias_router, prefix="/api/v1")
app.include_router(ingredientes_router, prefix="/api/v1")
app.include_router(productos_router, prefix="/api/v1")

# Dominio 3 - Gestión de Pedidos
app.include_router(pedidos_router, prefix="/api/v1")
app.include_router(pagos_router, prefix="/api/v1")



@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "version": "2.0.0"}
