from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional
from sqlmodel import Session, select, func

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.usuarios.models import Usuario
from app.modules.productos.models import Producto
from app.modules.admin.schemas import (
    DashboardMetricsResponse,
    MetricKPICards,
    ProductoVendidoResponse,
    ClienteMasCompradorResponse,
    DistribucionPedidosResponse,
    VentaTemporalResponse
)

class AdminService:
    @staticmethod
    def obtener_metricas_dashboard(
        session: Session,
        fecha_inicio_str: Optional[str] = None,
        fecha_fin_str: Optional[str] = None
    ) -> DashboardMetricsResponse:
        
        # 1. Resolver filtros temporales
        now = datetime.utcnow()
        if fecha_inicio_str:
            fecha_inicio = datetime.combine(datetime.strptime(fecha_inicio_str, "%Y-%m-%d").date(), datetime.min.time())
        else:
            fecha_inicio = now - timedelta(days=30)
            
        if fecha_fin_str:
            fecha_fin = datetime.combine(datetime.strptime(fecha_fin_str, "%Y-%m-%d").date(), datetime.max.time())
        else:
            fecha_fin = now

        # 2. Obtener Pedidos en el Rango y Activos (No eliminados lógicamente)
        # Traemos los pedidos dentro del rango de fechas
        stmt = select(Pedido).where(
            Pedido.created_at >= fecha_inicio,
            Pedido.created_at <= fecha_fin,
            Pedido.deleted_at == None
        )
        pedidos_rango = session.exec(stmt).all()

        # Separar pedidos válidos (no cancelados) para métricas financieras
        pedidos_validos = [p for p in pedidos_rango if p.estado_codigo != "CANCELADO"]

        # --- KPIs principales ---
        ingresos_totales = sum((p.total for p in pedidos_validos), Decimal("0.00"))
        cantidad_pedidos = len(pedidos_validos)
        
        if cantidad_pedidos > 0:
            ticket_promedio = ingresos_totales / Decimal(str(cantidad_pedidos))
        else:
            ticket_promedio = Decimal("0.00")
            
        clientes_activos_unicos = len(set(p.usuario_id for p in pedidos_validos))

        kpis = MetricKPICards(
            ingresos_totales=ingresos_totales,
            cantidad_pedidos=cantidad_pedidos,
            ticket_promedio=ticket_promedio,
            clientes_activos=clientes_activos_unicos
        )

        # --- Ranking de Productos Más Vendidos ---
        # Consultamos detalles unidos a pedidos en el rango que no estén cancelados ni eliminados
        stmt_productos = (
            select(
                DetallePedido.producto_id,
                DetallePedido.nombre_snapshot,
                func.sum(DetallePedido.cantidad).label("cantidad_vendida"),
                func.sum(DetallePedido.subtotal_snap).label("ingresos_generados")
            )
            .join(Pedido, DetallePedido.pedido_id == Pedido.id)
            .where(
                Pedido.created_at >= fecha_inicio,
                Pedido.created_at <= fecha_fin,
                Pedido.deleted_at == None,
                Pedido.estado_codigo != "CANCELADO"
            )
            .group_by(DetallePedido.producto_id, DetallePedido.nombre_snapshot)
            .order_by(func.sum(DetallePedido.cantidad).desc())
            .limit(5)
        )
        res_productos = session.exec(stmt_productos).all()
        productos_mas_vendidos = [
            ProductoVendidoResponse(
                producto_id=row[0],
                nombre=row[1],
                cantidad_vendida=row[2],
                ingresos_generados=row[3]
            ) for row in res_productos
        ]

        # --- Ranking de Clientes Más Compradores ---
        # Consultamos pedidos unidos a usuarios en el rango
        stmt_clientes = (
            select(
                Pedido.usuario_id,
                Usuario.nombre,
                Usuario.apellido,
                Usuario.email,
                func.count(Pedido.id).label("cantidad_pedidos"),
                func.sum(Pedido.total).label("total_gastado")
            )
            .join(Usuario, Pedido.usuario_id == Usuario.id)
            .where(
                Pedido.created_at >= fecha_inicio,
                Pedido.created_at <= fecha_fin,
                Pedido.deleted_at == None,
                Pedido.estado_codigo != "CANCELADO"
            )
            .group_by(Pedido.usuario_id, Usuario.nombre, Usuario.apellido, Usuario.email)
            .order_by(func.sum(Pedido.total).desc())
            .limit(5)
        )
        res_clientes = session.exec(stmt_clientes).all()
        clientes_mas_compradores = [
            ClienteMasCompradorResponse(
                usuario_id=row[0],
                nombre_completo=f"{row[1]} {row[2]}",
                email=row[3],
                cantidad_pedidos=row[4],
                total_gastado=row[5]
            ) for row in res_clientes
        ]

        # --- Distribución de Pedidos por Estado ---
        # Conteo agrupado por estado actual de pedidos (incluye cancelados y todos los activos)
        estados_dict = {}
        for p in pedidos_rango:
            estados_dict[p.estado_codigo] = estados_dict.get(p.estado_codigo, 0) + 1
            
        distribucion_pedidos = [
            DistribucionPedidosResponse(estado_codigo=est, cantidad=cant)
            for est, cant in estados_dict.items()
        ]

        # --- Evolución Temporal de Ventas ---
        # Agrupamiento diario en memoria (seguro y compatible con SQLite/PostgreSQL)
        fechas_dict = {}
        for p in pedidos_validos:
            fecha_key = p.created_at.strftime("%Y-%m-%d")
            if fecha_key not in fechas_dict:
                fechas_dict[fecha_key] = {"ingresos": Decimal("0.00"), "pedidos": 0}
            fechas_dict[fecha_key]["ingresos"] += p.total
            fechas_dict[fecha_key]["pedidos"] += 1
            
        # Convertir a lista y ordenar por fecha ascendentemente
        ventas_por_fecha = [
            VentaTemporalResponse(
                fecha=fec,
                ingresos=data["ingresos"],
                cantidad_pedidos=data["pedidos"]
            )
            for fec, data in sorted(fechas_dict.items())
        ]

        return DashboardMetricsResponse(
            kpis=kpis,
            productos_mas_vendidos=productos_mas_vendidos,
            clientes_mas_compradores=clientes_mas_compradores,
            distribucion_pedidos=distribucion_pedidos,
            ventas_por_fecha=ventas_por_fecha
        )
