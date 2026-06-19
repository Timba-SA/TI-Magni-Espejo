from fastapi import APIRouter, Depends, Request, Response, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.core.security import create_access_token
from app.core.middleware import limiter
from app.modules.auth.schemas import LoginRequest, RegisterRequest, TokenResponse, RefreshResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UsuarioDetailResponse
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/15minute")
def register(request: Request, data: RegisterRequest, response: Response, session: Session = Depends(get_session)):
    resultado = AuthService(session).register(data)
    response.set_cookie(
        key="access_token",
        value=resultado.access_token,
        httponly=True,
        max_age=900,
        samesite="lax",
        secure=False,
        path="/",
    )
    return resultado


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
@limiter.limit("5/15minute")
def login(request: Request, response: Response, data: LoginRequest, session: Session = Depends(get_session)):
    resultado = AuthService(session).login(data)
    response.set_cookie(
        key="access_token",
        value=resultado.access_token,
        httponly=True,
        max_age=900,
        samesite="lax",
        secure=False,
        path="/",
    )
    return resultado


@router.post("/refresh", response_model=RefreshResponse, status_code=status.HTTP_200_OK)
def refresh_token(response: Response, current_user: dict = Depends(get_current_user)):
    new_token = create_access_token({
        "sub": str(current_user["sub"]),
        "email": current_user["email"],
        "roles": current_user.get("roles", []),
    })
    response.set_cookie(
        key="access_token",
        value=new_token,
        httponly=True,
        max_age=900,
        samesite="lax",
        secure=False,
        path="/",
    )
    return RefreshResponse(access_token=new_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, _current_user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")


@router.get("/me", response_model=UsuarioDetailResponse, status_code=status.HTTP_200_OK)
def get_me(current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    usuario_id = int(current_user["sub"])
    return UsuarioService(session).get_me(usuario_id)
