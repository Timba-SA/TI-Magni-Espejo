import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from main import app as fastapi_app
from app.core.database import get_session
from app.core.dependencies import get_current_user, require_role

# Setup in-memory DB
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import ARRAY

@compiles(ARRAY, "sqlite")
def compile_array_sqlite(type_, compiler, **kw):
    return "TEXT"

# Import all models to ensure SQLModel metadata has them registered
import app.modules.auth.models
import app.modules.usuarios.models
import app.modules.pedidos.models
import app.modules.productos.models
import app.modules.categorias.models
import app.modules.ingredientes.models


def override_get_session():
    with Session(engine) as session:
        yield session

def override_get_current_user():
    return {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

def override_require_role():
    def _require_role():
        return {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}
    return _require_role

# Mock both the generic role checker and specific instantiations if needed
# FastAPI handles dependency overrides by matching the callable. 
# We'll just override the specific router endpoints if needed, but get_current_user is usually enough.

client = TestClient(fastapi_app)

@pytest.fixture(autouse=True)
def prepare_db():
    # Registrar overrides de forma aislada para este set de tests
    fastapi_app.dependency_overrides[get_session] = override_get_session
    fastapi_app.dependency_overrides[get_current_user] = override_get_current_user
    
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)
    
    # Limpiar overrides al finalizar para no interferir con otros tests
    fastapi_app.dependency_overrides.clear()

def test_categorias_pagination():
    # Insert 25 categories
    with Session(engine) as session:
        from app.modules.categorias.models import Categoria
        for i in range(25):
            session.add(Categoria(nombre=f"Cat {i}"))
        session.commit()

    response = client.get("/api/v1/categorias/?skip=10&limit=10")
    assert response.status_code == 200
    data = response.json()
    
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) == 10
    assert data["total"] == 25

def test_categorias_export():
    with Session(engine) as session:
        from app.modules.categorias.models import Categoria
        session.add(Categoria(nombre="Cat Export"))
        session.commit()

    response = client.get("/api/v1/categorias/exportar")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "attachment; filename=categorias.xlsx" in response.headers["content-disposition"]

def test_usuarios_pagination():
    # Insert 25 users
    with Session(engine) as session:
        from app.modules.usuarios.models import Usuario
        for i in range(25):
            session.add(Usuario(nombre=f"User {i}", apellido=f"Last {i}", email=f"user{i}@test.com", password_hash="pw"))
        session.commit()

    response = client.get("/api/v1/usuarios/?skip=10&limit=10")
    assert response.status_code == 200
    data = response.json()
    
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) == 10
    assert data["total"] == 25

def test_usuarios_export():
    with Session(engine) as session:
        from app.modules.usuarios.models import Usuario
        session.add(Usuario(nombre="Export User", apellido="Last", email="export@test.com", password_hash="pw"))
        session.commit()

    response = client.get("/api/v1/usuarios/exportar")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert "attachment; filename=usuarios.xlsx" in response.headers["content-disposition"]
