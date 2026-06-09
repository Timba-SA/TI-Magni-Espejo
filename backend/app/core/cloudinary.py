import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, status
from app.core.config import settings

# Inicializamos la configuración de Cloudinary
if not all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
    # No fallamos al importar, pero advertimos si faltan credenciales al intentar usarse.
    pass
else:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )


def upload_image(file_content: bytes, folder: str = "productos") -> str:
    """
    Sube el contenido binario de una imagen a Cloudinary y retorna su secure_url.
    """
    response = upload_image_raw(file_content, folder)
    return response.get("secure_url")


def upload_image_raw(file_content: bytes, folder: str = "productos") -> dict:
    """
    Sube el contenido binario de una imagen a Cloudinary y retorna el diccionario de respuesta completo.
    """
    if not all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Credenciales de Cloudinary no configuradas en el servidor."
        )
    
    try:
        response = cloudinary.uploader.upload(
            file_content,
            folder=folder,
            resource_type="image"
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error al subir imagen a Cloudinary: {str(e)}"
        )


def destroy_image(public_id: str) -> dict:
    """
    Elimina una imagen de Cloudinary por su public_id.
    """
    if not all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Credenciales de Cloudinary no configuradas en el servidor."
        )
        
    try:
        response = cloudinary.uploader.destroy(public_id)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error al eliminar imagen de Cloudinary: {str(e)}"
        )

