from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from app.modules.auth.models import RefreshToken, UsuarioRol
from app.modules.usuarios.models import Usuario


class AuthRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_user_by_email(self, email: str) -> Optional[Usuario]:
        statement = select(Usuario).where(Usuario.email == email, Usuario.deleted_at == None)
        return self.session.exec(statement).first()

    def get_user_roles(self, usuario_id: int) -> list[str]:
        statement = select(UsuarioRol.rol_codigo).where(UsuarioRol.usuario_id == usuario_id)
        return list(self.session.exec(statement).all())

    def get_refresh_token_by_hash(self, token_hash: str) -> Optional[RefreshToken]:
        statement = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at == None,
        )
        return self.session.exec(statement).first()

    def create_refresh_token(
        self,
        usuario_id: int,
        token_hash: str,
        expires_at: datetime,
    ) -> RefreshToken:
        rt = RefreshToken(
            token_hash=token_hash,
            usuario_id=usuario_id,
            expires_at=expires_at,
        )
        self.session.add(rt)
        self.session.flush()
        self.session.refresh(rt)
        return rt

    def revoke_refresh_token(self, refresh_token: RefreshToken) -> None:
        refresh_token.revoked_at = datetime.utcnow()
        self.session.add(refresh_token)
        self.session.flush()
