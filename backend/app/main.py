from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_tables
from app.modules.auth.router import router as auth_router
from app.modules.insumos.router import router as insumos_router
from app.modules.categorias.router import router as categorias_router

# Ensure tables are created
create_tables()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for The Food Store",
)

# CORS configuration
origins = [
    settings.FRONTEND_ORIGIN,
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(insumos_router)
app.include_router(categorias_router)

@app.get("/", tags=["Health"])
def root():
    return {"message": "The Food Store API funcionando correctamente"}

@app.get("/health", tags=["Health"])
def healthcheck():
    return {
        "status": "ok",
        "service": settings.APP_NAME
    }
