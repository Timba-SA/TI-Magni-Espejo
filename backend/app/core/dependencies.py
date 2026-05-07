from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.core.database import SessionLocal
from app.modules.auth.repository import UserRepository

bearer_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    """
    Dependency que extrae y valida el JWT del header Authorization.
    Retorna el payload del token (sub, rol, nombre).
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def require_role(*roles: str):
    """
    Factory de guards por rol.
    Uso: Depends(require_role("Admin")) o Depends(require_role("Admin", "Encargado"))
    """
    def _guard(current_user: dict = Depends(get_current_user)):
        user_rol = current_user.get("rol", "")
        if user_rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acción no permitida para el rol '{user_rol}'",
            )
        return current_user
    return _guard
