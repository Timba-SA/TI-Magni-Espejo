"""
Servicio de estadísticas — lógica de negocio.

Reglas del spec:
  EST-01: ingresos/métricas excluyen pedidos CANCELADOS.
  EST-02: ingresos de productos calculados con DetallePedido.subtotal_snap.
  EST-03: /ingresos solo cuenta pagos con mp_status == 'approved'.
  EST-04: todos los montos son Decimal.
  EST-05: filtros opcionales fecha_inicio / fecha_fin (formato YYYY-MM-DD).
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from sqlmodel import Session, select, func

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pagos.models import Pago
from app.modules.estadisticas.schemas import (
    ResumenResponse,
    VentaDiariaResponse,
    VentasResponse,
    ProductoTopResponse,
    ProductosTopResponse,
    EstadoDistribucionResponse,
    PedidosPorEstadoResponse,
    IngresosMesResponse,
    IngresosResponse,
)

_DATE_FMT = "%Y-%m-%d"


def _parse_rango(
    fecha_inicio_str: Optional[str],
    fecha_fin_str: Optional[str],
    default_days: int = 30,
) -> tuple[datetime, datetime]:
    now = datetime.utcnow()
    if fecha_inicio_str:
        fecha_inicio = datetime.strptime(fecha_inicio_str, _DATE_FMT)
    else:
        fecha_inicio = now - timedelta(days=default_days)
    if fecha_fin_str:
        # fin del día indicado
        fecha_fin = datetime.strptime(fecha_fin_str, _DATE_FMT).replace(
            hour=23, minute=59, second=59, microsecond=999999
        )
    else:
        fecha_fin = now
    return fecha_inicio, fecha_fin


def _pedidos_en_rango(
    session: Session,
    fecha_inicio: datetime,
    fecha_fin: datetime,
) -> list[Pedido]:
    stmt = select(Pedido).where(
        Pedido.created_at >= fecha_inicio,
        Pedido.created_at <= fecha_fin,
        Pedido.deleted_at.is_(None),  # type: ignore[attr-defined]
    )
    return list(session.exec(stmt).all())


# ── EST: resumen ──────────────────────────────────────────────────────────────

def get_resumen(
    session: Session,
    fecha_inicio_str: Optional[str] = None,
    fecha_fin_str: Optional[str] = None,
) -> ResumenResponse:
    fecha_inicio, fecha_fin = _parse_rango(fecha_inicio_str, fecha_fin_str)
    pedidos = _pedidos_en_rango(session, fecha_inicio, fecha_fin)

    cancelados = [p for p in pedidos if p.estado_codigo == "CANCELADO"]
    validos = [p for p in pedidos if p.estado_codigo != "CANCELADO"]  # EST-01

    ingresos = sum((p.total for p in validos), Decimal("0.00"))
    cantidad = len(validos)
    ticket = (ingresos / Decimal(cantidad)) if cantidad > 0 else Decimal("0.00")
    clientes = len({p.usuario_id for p in validos})

    return ResumenResponse(
        total_pedidos=cantidad,
        ingresos_totales=ingresos,
        ticket_promedio=ticket,
        clientes_unicos=clientes,
        pedidos_cancelados=len(cancelados),
    )


# ── EST: ventas (evolución diaria) ────────────────────────────────────────────

def get_ventas(
    session: Session,
    fecha_inicio_str: Optional[str] = None,
    fecha_fin_str: Optional[str] = None,
) -> VentasResponse:
    fecha_inicio, fecha_fin = _parse_rango(fecha_inicio_str, fecha_fin_str)
    pedidos = _pedidos_en_rango(session, fecha_inicio, fecha_fin)

    # EST-01: excluir CANCELADO
    validos = [p for p in pedidos if p.estado_codigo != "CANCELADO"]

    diario: dict[str, dict] = {}
    for p in validos:
        key = p.created_at.strftime(_DATE_FMT)
        if key not in diario:
            diario[key] = {"ingresos": Decimal("0.00"), "pedidos": 0}
        diario[key]["ingresos"] += p.total
        diario[key]["pedidos"] += 1

    ventas = [
        VentaDiariaResponse(
            fecha=fecha,
            ingresos=datos["ingresos"],
            cantidad_pedidos=datos["pedidos"],
        )
        for fecha, datos in sorted(diario.items())
    ]

    return VentasResponse(
        fecha_inicio=fecha_inicio.strftime(_DATE_FMT),
        fecha_fin=fecha_fin.strftime(_DATE_FMT),
        ventas=ventas,
    )


# ── EST: productos top ────────────────────────────────────────────────────────

def get_productos_top(
    session: Session,
    fecha_inicio_str: Optional[str] = None,
    fecha_fin_str: Optional[str] = None,
    limit: int = 10,
) -> ProductosTopResponse:
    fecha_inicio, fecha_fin = _parse_rango(fecha_inicio_str, fecha_fin_str)

    # EST-02: usar subtotal_snap; EST-01: excluir CANCELADO
    stmt = (
        select(
            DetallePedido.producto_id,
            DetallePedido.nombre_snapshot,
            func.sum(DetallePedido.cantidad).label("cantidad_vendida"),
            func.sum(DetallePedido.subtotal_snap).label("ingresos_generados"),  # EST-02
        )
        .join(Pedido, DetallePedido.pedido_id == Pedido.id)
        .where(
            Pedido.created_at >= fecha_inicio,
            Pedido.created_at <= fecha_fin,
            Pedido.deleted_at.is_(None),  # type: ignore[attr-defined]
            Pedido.estado_codigo != "CANCELADO",  # EST-01
        )
        .group_by(DetallePedido.producto_id, DetallePedido.nombre_snapshot)
        .order_by(func.sum(DetallePedido.cantidad).desc())
        .limit(limit)
    )
    rows = session.exec(stmt).all()

    productos = [
        ProductoTopResponse(
            producto_id=row[0],
            nombre=row[1],
            cantidad_vendida=int(row[2]),
            ingresos_generados=Decimal(str(row[3])),
        )
        for row in rows
    ]
    return ProductosTopResponse(productos=productos)


# ── EST: pedidos por estado ───────────────────────────────────────────────────

def get_pedidos_por_estado(
    session: Session,
    fecha_inicio_str: Optional[str] = None,
    fecha_fin_str: Optional[str] = None,
) -> PedidosPorEstadoResponse:
    fecha_inicio, fecha_fin = _parse_rango(fecha_inicio_str, fecha_fin_str)
    pedidos = _pedidos_en_rango(session, fecha_inicio, fecha_fin)

    total = len(pedidos)
    conteo: dict[str, int] = {}
    for p in pedidos:
        conteo[p.estado_codigo] = conteo.get(p.estado_codigo, 0) + 1

    distribucion = [
        EstadoDistribucionResponse(
            estado_codigo=estado,
            cantidad=cant,
            porcentaje=(
                Decimal(str(round(cant / total * 100, 2))) if total > 0 else Decimal("0.00")
            ),
        )
        for estado, cant in sorted(conteo.items())
    ]
    return PedidosPorEstadoResponse(total=total, distribucion=distribucion)


# ── EST: ingresos (solo pagos aprobados) ──────────────────────────────────────

def get_ingresos(
    session: Session,
    fecha_inicio_str: Optional[str] = None,
    fecha_fin_str: Optional[str] = None,
) -> IngresosResponse:
    fecha_inicio, fecha_fin = _parse_rango(fecha_inicio_str, fecha_fin_str)

    # EST-03: solo mp_status == 'approved'
    stmt = select(Pago).where(
        Pago.created_at >= fecha_inicio,
        Pago.created_at <= fecha_fin,
        Pago.mp_status == "approved",
    )
    pagos = list(session.exec(stmt).all())

    # Agrupar por mes (YYYY-MM)
    por_mes: dict[str, dict] = {}
    for pago in pagos:
        key = pago.created_at.strftime("%Y-%m")
        if key not in por_mes:
            por_mes[key] = {"ingresos": Decimal("0.00"), "pedidos": set()}
        por_mes[key]["ingresos"] += pago.transaction_amount
        por_mes[key]["pedidos"].add(pago.pedido_id)

    ingresos_por_mes = [
        IngresosMesResponse(
            mes=mes,
            ingresos=datos["ingresos"],
            cantidad_pedidos=len(datos["pedidos"]),
        )
        for mes, datos in sorted(por_mes.items())
    ]

    total_aprobado = sum((p.transaction_amount for p in pagos), Decimal("0.00"))

    return IngresosResponse(
        ingresos_por_mes=ingresos_por_mes,
        total_aprobado=total_aprobado,
    )
