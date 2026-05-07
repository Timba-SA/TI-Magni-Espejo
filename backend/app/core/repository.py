from datetime import datetime, timezone
from typing import Generic, TypeVar, Type, Optional
from sqlmodel import SQLModel, Session, select, func

ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, id: int) -> Optional[ModelType]:
        return self.session.get(self.model, id)

    def get_all(self) -> list[ModelType]:
        return self.session.exec(select(self.model)).all()

    def count(self) -> int:
        result = self.session.exec(select(func.count()).select_from(self.model))
        return result.one()

    def add(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def update(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def soft_delete(self, obj: ModelType) -> None:
        """Marca el registro como eliminado (deleted_at = now()).
        Solo aplica a modelos que tengan el campo deleted_at."""
        if not hasattr(obj, "deleted_at"):
            raise AttributeError(
                f"{self.model.__name__} no soporta soft-delete (no tiene deleted_at)."
            )
        obj.deleted_at = datetime.now(timezone.utc)  # type: ignore[attr-defined]
        self.session.add(obj)
        self.session.flush()

    def hard_delete(self, obj: ModelType) -> None:
        """Elimina el registro físicamente de la base de datos. Usar con precaución."""
        self.session.delete(obj)
