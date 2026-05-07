from app.shared.unit_of_work import UnitOfWork
from app.shared.exceptions import AppException, NotFoundException
from app.modules.categorias.schemas import CategoriaCreate, CategoriaResponse

class CategoriaService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self) -> list[CategoriaResponse]:
        with self.uow:
            categorias = self.uow.categorias.get_all()
            return [CategoriaResponse.model_validate(c) for c in categorias]

    def create(self, data: CategoriaCreate) -> CategoriaResponse:
        with self.uow:
            existente = self.uow.categorias.get_by_nombre(data.nombre)
            if existente:
                raise AppException(status_code=409, message=f"La categoría '{data.nombre}' ya existe")
            categoria = self.uow.categorias.create(data.model_dump())
            self.uow.commit()
            return CategoriaResponse.model_validate(categoria)

    def delete(self, categoria_id: int) -> CategoriaResponse:
        with self.uow:
            categoria = self.uow.categorias.delete(categoria_id)
            if not categoria:
                raise NotFoundException("Categoría no encontrada")
            self.uow.commit()
            return CategoriaResponse.model_validate(categoria)
