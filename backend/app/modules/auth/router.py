from fastapi import APIRouter, Depends, Request, Response, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.core.middleware import limiter
from app.modules.auth.schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, response: Response, session: Session = Depends(get_session)):
    """Registra un nuevo usuario y retorna tokens (queda logueado directamente)."""
    resultado = AuthService(session).register(data)
    response.set_cookie(
        key="access_token",
        value=resultado.access_token,
        httponly=True,
        max_age=1800,
        samesite="lax",
        secure=False,
    )
    return resultado

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
def login(request: Request, response: Response,data: LoginRequest, session: Session = Depends(get_session)):
    resultado = AuthService(session).login(data)
    response.set_cookie(
        key="access_token",
        value=resultado.access_token,
        httponly=True,
        max_age=1800,
        samesite="lax",
        secure=False,
    )
    return resultado

@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def refresh(data: RefreshRequest, response: Response,session: Session = Depends(get_session)):
    resultado = AuthService(session).refresh(data.refresh_token)
    response.set_cookie(
        key="access_token",
        value=resultado.access_token,
        httponly=True,
        max_age=1800,
        samesite="lax",
        secure=False,
    )
    return resultado


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    data: RefreshRequest, 
    response: Response,
    session: Session = Depends(get_session),
    _current_user: dict = Depends(get_current_user),
):
    AuthService(session).logout(data.refresh_token)
    response.delete_cookie("access_token")
