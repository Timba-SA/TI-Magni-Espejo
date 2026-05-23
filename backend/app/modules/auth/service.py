from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
)
from app.core.config import settings
from app.modules.auth.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.modules.auth.unit_of_work import AuthUoW
from app.modules.usuarios.models import Usuario
from app.modules.auth.models import UsuarioRol


# Prioridad de roles: índice más bajo = mayor privilegio
ROL_PRIORITY: dict[str, int] = {
    "ADMIN": 0,
    "ENCARGADO": 1,
    "CAJERO": 2,
    "COCINERO": 3,
    "STOCK": 4,
    "CLIENT": 5,
}

def get_primary_role(roles: list[str]) -> str:
    """Devuelve el rol con mayor privilegio de la lista."""
    if not roles:
        return "CLIENT"
    return min(roles, key=lambda r: ROL_PRIORITY.get(r, 99))


class AuthService:

    def __init__(self, session: Session):
        self._session = session

    def register(self, data: RegisterRequest) -> TokenResponse:
        with AuthUoW(self._session) as uow:
            # Verificar que el email no esté en uso
            existing = uow.auth.get_user_by_email(data.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe una cuenta registrada con ese email.",
                )

            # Crear el usuario
            nuevo = Usuario(
                nombre=data.nombre,
                apellido=data.apellido or "",
                email=data.email,
                password_hash=get_password_hash(data.password),
                is_active=True,
            )
            uow._session.add(nuevo)
            uow.flush()  # para obtener el ID antes del commit
            uow._session.refresh(nuevo)

            # Asignar rol CLIENT por defecto
            rol = UsuarioRol(usuario_id=nuevo.id, rol_codigo="CLIENT")
            uow._session.add(rol)

            # Emitir tokens — queda logueado directamente tras el registro
            roles = ["CLIENT"]
            access_token = create_access_token(
                {"sub": str(nuevo.id), "email": nuevo.email, "roles": roles}
            )
            refresh_plain = create_refresh_token()
            token_hash = hash_refresh_token(refresh_plain)
            expires_at = datetime.now(timezone.utc) + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )
            uow.auth.create_refresh_token(nuevo.id, token_hash, expires_at)
            # El __exit__ del UoW hace commit de todo en una sola transacción

        self._session.refresh(nuevo)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_plain,
            user={
                "id": nuevo.id,
                "username": nuevo.email.split("@")[0],
                "nombre": nuevo.nombre,
                "apellido": nuevo.apellido,
                "email": nuevo.email,
                "rol": get_primary_role(roles),
            },
        )

    def login(self, data: LoginRequest) -> TokenResponse:
        with AuthUoW(self._session) as uow:
            user = uow.auth.get_user_by_email(data.email)

            # Mismo mensaje para email inexistente o contraseña incorrecta (no filtrar info)
            invalid_exc = HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas.",
            )
            if not user or not verify_password(data.password, user.password_hash):
                raise invalid_exc

            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Tu cuenta está suspendida. Contactá al administrador.",
                )

            roles = uow.auth.get_user_roles(user.id)
            access_token = create_access_token(
                {"sub": str(user.id), "email": user.email, "roles": roles}
            )

            # Refresh token: el cliente recibe plaintext, la DB guarda el hash
            refresh_plain = create_refresh_token()
            token_hash = hash_refresh_token(refresh_plain)
            expires_at = datetime.now(timezone.utc) + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )
            uow.auth.create_refresh_token(user.id, token_hash, expires_at)
            # El __exit__ del UoW hace commit al salir sin excepción

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_plain,
            user={
                "id": user.id,
                "username": user.email.split("@")[0],
                "nombre": user.nombre,
                "apellido": user.apellido,
                "email": user.email,
                "rol": get_primary_role(roles),
            }
        )

    def refresh(self, refresh_token_plain: str) -> TokenResponse:
        with AuthUoW(self._session) as uow:
            token_hash = hash_refresh_token(refresh_token_plain)
            stored = uow.auth.get_refresh_token_by_hash(token_hash)

            if not stored:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Refresh token inválido o revocado.",
                )

            # Verificar expiración
            if datetime.now(timezone.utc) > stored.expires_at.replace(tzinfo=timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Refresh token expirado.",
                )

            # Rotación: revocar el actual y emitir uno nuevo
            uow.auth.revoke_refresh_token(stored)

            roles = uow.auth.get_user_roles(stored.usuario_id)
            user = stored.usuario
            access_token = create_access_token(
                {"sub": str(stored.usuario_id), "email": user.email, "roles": roles}
            )

            refresh_plain = create_refresh_token()
            new_hash = hash_refresh_token(refresh_plain)
            expires_at = datetime.now(timezone.utc) + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )
            uow.auth.create_refresh_token(stored.usuario_id, new_hash, expires_at)
            # El __exit__ del UoW hace commit al salir sin excepción

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_plain,
            user={
                "id": user.id,
                "username": user.email.split("@")[0],
                "nombre": user.nombre,
                "apellido": user.apellido,
                "email": user.email,
                "rol": get_primary_role(roles),
            }
        )

    def logout(self, refresh_token_plain: str) -> None:
        with AuthUoW(self._session) as uow:
            token_hash = hash_refresh_token(refresh_token_plain)
            stored = uow.auth.get_refresh_token_by_hash(token_hash)

            if stored:
                uow.auth.revoke_refresh_token(stored)
            # Si no existe el token, no se hace nada; el __exit__ hace commit (sin cambios)
