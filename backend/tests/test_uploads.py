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


def test_subir_imagen_success():
    """
    Verifica que un ADMIN pueda subir una imagen válida con éxito.
    """
    mock_response = {
        "secure_url": "https://res.cloudinary.com/dixv7g4p7/image/upload/v1/productos/test_image.jpg",
        "public_id": "productos/test_image",
        "width": 800,
        "height": 600,
        "format": "jpg",
        "resource_type": "image"
    }
    
    with patch("cloudinary.uploader.upload", return_value=mock_response) as mock_upload:
        image_data = b"fake-image-bytes"
        file = {"file": ("test.jpg", io.BytesIO(image_data), "image/jpeg")}
        
        response = client.post("/api/v1/uploads/imagen", files=file)
        
        assert response.status_code == 201
        res_json = response.json()
        assert res_json["secure_url"] == mock_response["secure_url"]
        assert res_json["public_id"] == mock_response["public_id"]
        assert res_json["width"] == 800
        mock_upload.assert_called_once_with(image_data, folder="productos", resource_type="image")


def test_subir_imagen_invalid_mime():
    """
    Verifica que se rechace un tipo de archivo no válido (MIME != image/*).
    """
    file = {"file": ("test.txt", io.BytesIO(b"fake txt"), "text/plain")}
    response = client.post("/api/v1/uploads/imagen", files=file)
    
    assert response.status_code == 400
    assert "no es una imagen válida" in response.json()["detail"]


def test_subir_imagen_unauthorized():
    """
    Verifica que un usuario sin rol ADMIN sea rechazado con HTTP 403.
    """
    global current_test_user
    original_user = current_test_user
    current_test_user = {"sub": 2, "email": "user@test.com", "roles": ["USER"]}
    
    try:
        file = {"file": ("test.jpg", io.BytesIO(b"fake-image-bytes"), "image/jpeg")}
        response = client.post("/api/v1/uploads/imagen", files=file)
        assert response.status_code == 403
    finally:
        current_test_user = original_user


def test_eliminar_imagen_success():
    """
    Verifica que un ADMIN pueda eliminar una imagen de Cloudinary usando su public_id.
    """
    mock_destroy_response = {"result": "ok"}
    
    with patch("cloudinary.uploader.destroy", return_value=mock_destroy_response) as mock_destroy:
        public_id = "productos/test_image"
        # URL encode is handled naturally by TestClient/requests
        response = client.delete(f"/api/v1/uploads/imagen/{public_id}")
        
        assert response.status_code == 204
        mock_destroy.assert_called_once_with(public_id)


def test_eliminar_imagen_not_found():
    """
    Verifica que se retorne HTTP 404 si Cloudinary devuelve result='not found'.
    """
    mock_destroy_response = {"result": "not found"}
    
    with patch("cloudinary.uploader.destroy", return_value=mock_destroy_response):
        public_id = "productos/non_existing"
        response = client.delete(f"/api/v1/uploads/imagen/{public_id}")
        
        assert response.status_code == 404
        assert "no fue encontrada" in response.json()["detail"]


def test_eliminar_imagen_unauthorized():
    """
    Verifica que la eliminación de imágenes sea denegada a usuarios no autorizados (no ADMIN).
    """
    global current_test_user
    original_user = current_test_user
    current_test_user = {"sub": 3, "email": "user@test.com", "roles": ["STOCK"]}
    
    try:
        response = client.delete("/api/v1/uploads/imagen/productos/some_id")
        assert response.status_code == 403
    finally:
        current_test_user = original_user
