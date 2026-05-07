from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional
from app.modules.insumos.models import InsumoModel
from datetime import datetime

class InsumoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, search: Optional[str] = None, categoria: Optional[str] = None, estado: Optional[str] = None, stock_bajo: Optional[bool] = None):
        query = self.db.query(InsumoModel)
        
        if search:
            query = query.filter(InsumoModel.nombre.ilike(f"%{search}%"))
        
        if categoria:
            query = query.filter(InsumoModel.categoria == categoria)
            
        if estado:
            query = query.filter(InsumoModel.estado == estado)
            
        if stock_bajo is not None:
            if stock_bajo:
                query = query.filter(InsumoModel.stock_actual <= InsumoModel.stock_minimo)
            else:
                query = query.filter(InsumoModel.stock_actual > InsumoModel.stock_minimo)
                
        return query.all()

    def get_by_id(self, insumo_id: int):
        return self.db.query(InsumoModel).filter(InsumoModel.id == insumo_id).first()

    def create(self, data: dict):
        db_insumo = InsumoModel(**data)
        self.db.add(db_insumo)
        return db_insumo

    def update(self, insumo_id: int, data: dict):
        db_insumo = self.get_by_id(insumo_id)
        if not db_insumo:
            return None
            
        for key, value in data.items():
            setattr(db_insumo, key, value)
            
        db_insumo.fecha_actualizacion = datetime.utcnow()
        return db_insumo

    def logical_delete(self, insumo_id: int):
        db_insumo = self.get_by_id(insumo_id)
        if not db_insumo:
            return None
            
        db_insumo.estado = "Inactivo"
        db_insumo.fecha_actualizacion = datetime.utcnow()
        return db_insumo

    def reactivate(self, insumo_id: int):
        db_insumo = self.get_by_id(insumo_id)
        if not db_insumo:
            return None
            
        db_insumo.estado = "Activo"
        db_insumo.fecha_actualizacion = datetime.utcnow()
        return db_insumo

    def count_all(self) -> int:
        return self.db.query(func.count(InsumoModel.id)).scalar()

    def count_by_estado(self, estado: str) -> int:
        return self.db.query(func.count(InsumoModel.id)).filter(InsumoModel.estado == estado).scalar()

    def count_stock_bajo(self) -> int:
        return self.db.query(func.count(InsumoModel.id)).filter(
            InsumoModel.stock_actual <= InsumoModel.stock_minimo,
            InsumoModel.estado == "Activo"
        ).scalar()

    def get_inventory_value(self) -> float:
        # Sums stock * precio for active insumos
        value = self.db.query(func.sum(InsumoModel.stock_actual * InsumoModel.precio_unitario)).filter(
            InsumoModel.estado == "Activo"
        ).scalar()
        return value if value else 0.0
