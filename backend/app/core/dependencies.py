from typing import Callable

from fastapi import Depends, HTTPException, status, Request

from app.core.security import decode_access_token


def get_current_user(request: Request) -> dict:
    """
    Extrae el token de autenticación.
    Prioridad: cookie HttpOnly `access_token` → header `Authorization: Bearer <token>`.
    Lanza HTTP 401 si ninguno está presente o es inválido.
    """
    # 1. Cookie HttpOnly (mecanismo principal post-037)
    token = request.cookies.get("access_token")

    # 2. Fallback: Authorization Bearer (compatible con localStorage del frontend)
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[len("Bearer "):].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación faltante.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_access_token(token)


def require_role(*roles: str) -> Callable:
    """
    Fábrica de dependencias FastAPI.
    Uso: `Depends(require_role("ADMIN", "STOCK"))`.
    Valida que el usuario tenga al menos uno de los roles requeridos.
    Lanza HTTP 403 si no tiene permisos.
    """
    def _check_role(payload: dict = Depends(get_current_user)) -> dict:
        user_roles: list[str] = payload.get("roles", [])
        if not any(r in user_roles for r in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los roles: {', '.join(roles)}.",
            )
        return payload

    return _check_role