from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any
from sqlmodel import SQLModel


class IniciarPagoRequest(SQLModel):
    pedido_id: int


class WebhookPayload(SQLModel):
    action: Optional[str] = None
    type: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class PagoResponse(SQLModel):
    id: int
    pedido_id: int
    mp_payment_id: Optional[int] = None
    mp_status: str
    mp_status_detail: Optional[str] = None
    external_reference: str
    transaction_amount: Decimal
    payment_method_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PreferenceResponse(SQLModel):
    preference_id: str
    init_point: str
