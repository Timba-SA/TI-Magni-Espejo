from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    nombre: str
    apellido: Optional[str] = ""
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
