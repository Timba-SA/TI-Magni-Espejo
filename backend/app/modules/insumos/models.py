from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class InsumoModel(Base):
    __tablename__ = "insumos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False, index=True)
    descripcion = Column(String, nullable=True)
    categoria = Column(String, nullable=False, index=True)
    unidad_medida = Column(String, nullable=False)
    stock_actual = Column(Float, default=0, nullable=False)
    stock_minimo = Column(Float, default=0, nullable=False)
    precio_unitario = Column(Float, default=0, nullable=False)
    estado = Column(String, default="Activo", nullable=False)
    fecha_alta = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(DateTime, nullable=True, onupdate=datetime.utcnow)
