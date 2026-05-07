from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    usernameOrEmail: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    nombre: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    nombre: str
    rol: str
    activo: bool

class LoginResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserResponse

class UpdateRolRequest(BaseModel):
    rol: str

class UpdateEstadoRequest(BaseModel):
    activo: bool
