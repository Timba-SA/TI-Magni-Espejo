from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.modules.auth.schemas import LoginRequest, LoginResponse, UserCreate, UserResponse, UpdateRolRequest, UpdateEstadoRequest
from app.modules.auth.service import AuthService
from app.shared.unit_of_work import UnitOfWork
from app.core.database import SessionLocal
from app.core.dependencies import require_role
from app.shared.exceptions import AppException

router = APIRouter(prefix="/api/auth", tags=["Auth"])

def get_uow():
    return UnitOfWork(SessionLocal)

def get_auth_service(uow: UnitOfWork = Depends(get_uow)):
    return AuthService(uow)

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, service: AuthService = Depends(get_auth_service)):
    try:
        user, token = service.authenticate_user(credentials)
        return LoginResponse(
            success=True,
            message="Login exitoso",
            token=token,
            user=user,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.post("/register", response_model=UserResponse, description="Registro de nuevos usuarios. Rol asignado: Cliente.")
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)):
    try:
        return service.register_user(data)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.get("/users", response_model=List[UserResponse], dependencies=[Depends(require_role("Admin"))])
def list_users(uow: UnitOfWork = Depends(get_uow)):
    """Solo Admin puede listar todos los usuarios."""
    with uow:
        users = uow.users.get_all()
        return [
            UserResponse(id=u.id, username=u.username, email=u.email, nombre=u.nombre, rol=u.rol, activo=u.activo)
            for u in users
        ]

@router.patch("/users/{user_id}/rol", response_model=UserResponse, dependencies=[Depends(require_role("Admin"))])
def update_user_rol(user_id: int, data: UpdateRolRequest, service: AuthService = Depends(get_auth_service)):
    """Solo Admin puede cambiar el rol de un usuario."""
    try:
        return service.update_rol(user_id, data.rol)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.patch("/users/{user_id}/estado", response_model=UserResponse, dependencies=[Depends(require_role("Admin"))])
def update_user_estado(user_id: int, data: UpdateEstadoRequest, service: AuthService = Depends(get_auth_service)):
    """Solo Admin puede suspender o reactivar un usuario."""
    try:
        return service.update_estado(user_id, data.activo)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
