from typing import Optional
from app.shared.unit_of_work import UnitOfWork
from app.shared.exceptions import NotFoundException
from app.modules.insumos.schemas import InsumoCreate, InsumoUpdate, InsumosStatsResponse
from app.modules.insumos.mappers import to_insumo_response

class InsumoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self, search: Optional[str] = None, categoria: Optional[str] = None, estado: Optional[str] = None, stock_bajo: Optional[bool] = None):
        with self.uow:
            insumos = self.uow.insumos.get_all(search, categoria, estado, stock_bajo)
            return [to_insumo_response(i) for i in insumos]

    def get_by_id(self, insumo_id: int):
        with self.uow:
            insumo = self.uow.insumos.get_by_id(insumo_id)
            if not insumo:
                raise NotFoundException("Insumo no encontrado")
            return to_insumo_response(insumo)

    def create(self, data: InsumoCreate):
        with self.uow:
            insumo = self.uow.insumos.create(data.model_dump())
            self.uow.commit()
            return to_insumo_response(insumo)

    def update(self, insumo_id: int, data: InsumoUpdate):
        with self.uow:
            update_data = data.model_dump(exclude_unset=True)
            insumo = self.uow.insumos.update(insumo_id, update_data)
            if not insumo:
                raise NotFoundException("Insumo no encontrado")
            self.uow.commit()
            return to_insumo_response(insumo)

    def logical_delete(self, insumo_id: int):
        with self.uow:
            insumo = self.uow.insumos.logical_delete(insumo_id)
            if not insumo:
                raise NotFoundException("Insumo no encontrado")
            self.uow.commit()
            return to_insumo_response(insumo)

    def reactivate(self, insumo_id: int):
        with self.uow:
            insumo = self.uow.insumos.reactivate(insumo_id)
            if not insumo:
                raise NotFoundException("Insumo no encontrado")
            self.uow.commit()
            return to_insumo_response(insumo)

    def get_stats(self):
        with self.uow:
            total = self.uow.insumos.count_all()
            activos = self.uow.insumos.count_by_estado("Activo")
            inactivos = self.uow.insumos.count_by_estado("Inactivo")
            stock_bajo = self.uow.insumos.count_stock_bajo()
            valor_inventario = self.uow.insumos.get_inventory_value()

            return InsumosStatsResponse(
                total=total,
                activos=activos,
                inactivos=inactivos,
                stock_bajo=stock_bajo,
                valor_inventario=valor_inventario
            )
