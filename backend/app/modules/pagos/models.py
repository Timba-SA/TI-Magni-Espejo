from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, Column, Numeric

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido

class Pago(SQLModel, table=True):
    __tablename__ = "pagos"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False)
    
    mp_payment_id: Optional[int] = Field(default=None, unique=True, nullable=True)
    mp_status: str = Field(default="pending", max_length=30, nullable=False)
    mp_status_detail: Optional[str] = Field(default=None, max_length=100)
    
    external_reference: str = Field(max_length=100, unique=True, nullable=False)
    idempotency_key: str = Field(max_length=100, unique=True, nullable=False)
    
    transaction_amount: Decimal = Field(
        sa_column=Column(Numeric(precision=10, scale=2), nullable=False)
    )
    
    preference_id: Optional[str] = Field(default=None, max_length=100, nullable=True)
    init_point: Optional[str] = Field(default=None, max_length=255, nullable=True)
    payment_method_id: Optional[str] = Field(default=None, max_length=50)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relación
    pedido: Optional["Pedido"] = Relationship()
