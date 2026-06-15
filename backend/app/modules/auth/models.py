from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario

class Rol(SQLModel, table=True):
    __tablename__ = "roles"
    
    codigo: str = Field(primary_key=True, max_length=20)
    nombre: str = Field(max_length=50, nullable=False, unique=True)
    descripcion: Optional[str] = Field(default=None)
    
    usuario_roles: list["UsuarioRol"] = Relationship(back_populates="rol")

class UsuarioRol(SQLModel, table=True):
    __tablename__ = "usuario_roles"
    
    usuario_id: int = Field(foreign_key="usuarios.id", primary_key=True)
    rol_codigo: str = Field(foreign_key="roles.codigo", primary_key=True)
    
    asignado_por_id: Optional[int] = Field(default=None, foreign_key="usuarios.id", nullable=True)
    expires_at: Optional[datetime] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    
    usuario: Optional["Usuario"] = Relationship(
        back_populates="usuario_roles",
        sa_relationship_kwargs={"foreign_keys": "[UsuarioRol.usuario_id]"}
    )
    rol: Optional[Rol] = Relationship(back_populates="usuario_roles")
    
    asignado_por: Optional["Usuario"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[UsuarioRol.asignado_por_id]"}
    )

