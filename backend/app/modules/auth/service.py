from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from app.core.config import settings
from app.modules.auth.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.modules.auth.unit_of_work import AuthUoW
from app.modules.usuarios.models import Usuario
from app.modules.auth.models import UsuarioRol
from fastapi import HTTPException, status
from sqlmodel import Session


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
            existing = uow.auth.get_user_by_email(data.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe una cuenta registrada con ese email.",
                )

            nuevo = Usuario(
                nombre=data.nombre,
                apellido=data.apellido or "",
                email=data.email,
                password_hash=get_password_hash(data.password),
                is_active=True,
            )
            uow._session.add(nuevo)
            uow.flush()
            uow._session.refresh(nuevo)

            rol = UsuarioRol(usuario_id=nuevo.id, rol_codigo="CLIENT")
            uow._session.add(rol)

            roles = ["CLIENT"]
            access_token = create_access_token(
                {"sub": str(nuevo.id), "email": nuevo.email, "roles": roles}
            )

        self._session.refresh(nuevo)
        return TokenResponse(
            access_token=access_token,
            user={
                "id": nuevo.id,
                "username": nuevo.email.split("@")[0],
                "nombre": nuevo.nombre,
                "apellido": nuevo.apellido,
                "email": nuevo.email,
                "rol": get_primary_role(roles),
                "roles": roles,
            },
        )

    def login(self, data: LoginRequest) -> TokenResponse:
        with AuthUoW(self._session) as uow:
            user = uow.auth.get_user_by_email(data.email)

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

        return TokenResponse(
            access_token=access_token,
            user={
                "id": user.id,
                "username": user.email.split("@")[0],
                "nombre": user.nombre,
                "apellido": user.apellido,
                "email": user.email,
                "rol": get_primary_role(roles),
                "roles": roles,
            }
        )
