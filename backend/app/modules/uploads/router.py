from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from app.core.dependencies import require_role
from app.core.cloudinary import upload_image_raw, destroy_image
from app.modules.uploads.schemas import CloudinaryResponse

router = APIRouter(prefix="/uploads", tags=["Uploads"])

@router.post("/imagen", response_model=CloudinaryResponse, status_code=status.HTTP_201_CREATED)
def subir_imagen(
    file: UploadFile = File(...),
    _current_user: dict = Depends(require_role("ADMIN")),
):
    """
    Sube una imagen a Cloudinary. Recibe multipart/form-data.
    Devuelve secure_url, public_id, width, height, format, resource_type.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo proporcionado no es una imagen válida."
        )
    
    try:
        content = file.file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pudo leer el archivo: {str(e)}"
        )
        
    res = upload_image_raw(content)
    
    return CloudinaryResponse(
        secure_url=res.get("secure_url"),
        public_id=res.get("public_id"),
        width=res.get("width", 0),
        height=res.get("height", 0),
        format=res.get("format", ""),
        resource_type=res.get("resource_type", "")
    )


@router.delete("/imagen/{public_id:path}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_imagen(
    public_id: str,
    _current_user: dict = Depends(require_role("ADMIN")),
):
    """
    Elimina una imagen de Cloudinary por su public_id.
    """
    res = destroy_image(public_id)
    if res.get("result") == "not found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La imagen especificada no fue encontrada."
        )
