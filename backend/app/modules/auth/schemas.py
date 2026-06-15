from typing import Any, Optional
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    nombre: str
    apellido: Optional[str] = ""
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]
