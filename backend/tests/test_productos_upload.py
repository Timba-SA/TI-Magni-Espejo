import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
import io

from main import app
from app.core.database import get_session
from app.core.dependencies import get_current_user

# Setup in-memory DB para testeo
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

current_test_user = {"sub": 1, "email": "admin@test.com", "roles": ["ADMIN"]}

def override_get_session():
    with Session(engine) as session:
        yield session

def override_get_current_user():
    return current_test_user

client = TestClient(app)

@pytest.fixture(autouse=True)
def prepare_db():
    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = override_get_current_user
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)
    app.dependency_overrides.clear()


def test_upload_image_success():
    """
    Verifica que un usuario con rol ADMIN pueda subir una imagen válida con éxito.
    """
    # Mockear cloudinary upload
    mock_response = {
        "secure_url": "https://res.cloudinary.com/dixv7g4p7/image/upload/v1/productos/test_image.jpg"
    }
    
    with patch("cloudinary.uploader.upload", return_value=mock_response) as mock_upload:
        # Generar un archivo de imagen en memoria
        image_data = b"fake-image-bytes"
        file = {"file": ("test.jpg", io.BytesIO(image_data), "image/jpeg")}
        
        response = client.post("/api/v1/productos/upload", files=file)
        
        assert response.status_code == 200
        assert response.json() == {"url": "https://res.cloudinary.com/dixv7g4p7/image/upload/v1/productos/test_image.jpg"}
        mock_upload.assert_called_once_with(image_data, folder="productos", resource_type="image")


def test_upload_image_invalid_type():
    """
    Verifica que se rechace un archivo que no sea de tipo imagen (ej: text/plain).
    """
    file = {"file": ("test.txt", io.BytesIO(b"fake text content"), "text/plain")}
    
    response = client.post("/api/v1/productos/upload", files=file)
    
    assert response.status_code == 400
    assert "no es una imagen válida" in response.json()["detail"]


def test_upload_image_unauthorized():
    """
    Verifica que un usuario sin rol adecuado (ej: USER ordinario) sea rechazado con HTTP 403.
    """
    global current_test_user
    # Cambiamos temporalmente el rol del usuario de prueba a USER ordinario
    original_user = current_test_user
    current_test_user = {"sub": 2, "email": "user@test.com", "roles": ["USER"]}
    
    try:
        file = {"file": ("test.jpg", io.BytesIO(b"fake-image-bytes"), "image/jpeg")}
        response = client.post("/api/v1/productos/upload", files=file)
        
        assert response.status_code == 403
        assert "Se requiere uno de los roles" in response.json()["detail"]
    finally:
        current_test_user = original_user
