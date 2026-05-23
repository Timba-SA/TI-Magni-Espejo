from typing import Optional
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    nombre: str
    apellido: Optional[str] = ""
    email: EmailStr
    password: str



class LoginRequest(BaseModel):
    email: EmailStr
    password: str


from typing import Any

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


class RefreshRequest(BaseModel):
    refresh_token: str
