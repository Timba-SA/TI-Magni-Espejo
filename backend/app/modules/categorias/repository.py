from sqlalchemy.orm import Session
from app.modules.categorias.models import CategoriaModel

class CategoriaRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[CategoriaModel]:
        return self.db.query(CategoriaModel).order_by(CategoriaModel.nombre).all()

    def get_by_id(self, categoria_id: int) -> CategoriaModel | None:
        return self.db.query(CategoriaModel).filter(CategoriaModel.id == categoria_id).first()

    def get_by_nombre(self, nombre: str) -> CategoriaModel | None:
        return self.db.query(CategoriaModel).filter(CategoriaModel.nombre == nombre).first()

    def create(self, data: dict) -> CategoriaModel:
        categoria = CategoriaModel(**data)
        self.db.add(categoria)
        return categoria

    def delete(self, categoria_id: int) -> CategoriaModel | None:
        categoria = self.get_by_id(categoria_id)
        if categoria:
            self.db.delete(categoria)
        return categoria
