from typing import Optional
from sqlmodel import Session, select
from app.core.repository import BaseRepository
from app.modules.direcciones.models import DireccionEntrega

class DireccionRepository(BaseRepository[DireccionEntrega]):
    def __init__(self, session: Session):
        super().__init__(DireccionEntrega, session)

    def get_by_id_and_user(self, direccion_id: int, usuario_id: int) -> Optional[DireccionEntrega]:
        """Obtiene una dirección por id y usuario, validando que no esté eliminada."""
        return self.session.exec(
            select(DireccionEntrega).where(
                DireccionEntrega.id == direccion_id,
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.deleted_at == None  # noqa: E711
            )
        ).first()

    def get_all_active_by_user(self, usuario_id: int) -> list[DireccionEntrega]:
        """Obtiene todas las direcciones activas (no eliminadas) de un usuario."""
        return self.session.exec(
            select(DireccionEntrega).where(
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.deleted_at == None  # noqa: E711
            )
        ).all()

    def desmarcar_principales_previas(self, usuario_id: int) -> None:
        """Desmarca como principales todas las direcciones activas previas del usuario."""
        principales = self.session.exec(
            select(DireccionEntrega).where(
                DireccionEntrega.usuario_id == usuario_id,
                DireccionEntrega.es_principal == True,
                DireccionEntrega.deleted_at == None  # noqa: E711
            )
        ).all()
        for d in principales:
            d.es_principal = False
            self.session.add(d)
        self.session.flush()
