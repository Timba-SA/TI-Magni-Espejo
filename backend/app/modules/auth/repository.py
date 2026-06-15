from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from app.modules.auth.models import UsuarioRol
from app.modules.usuarios.models import Usuario


class AuthRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_user_by_email(self, email: str) -> Optional[Usuario]:
        statement = select(Usuario).where(Usuario.email == email, Usuario.deleted_at == None)
        return self.session.exec(statement).first()

    def get_user_roles(self, usuario_id: int) -> list[str]:
        statement = select(UsuarioRol.rol_codigo).where(
            UsuarioRol.usuario_id == usuario_id,
            (UsuarioRol.expires_at == None) | (UsuarioRol.expires_at > datetime.utcnow())
        )
        return list(self.session.exec(statement).all())
