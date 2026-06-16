from datetime import datetime
from decimal import Decimal
from typing import Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.modules.productos.models import Producto
from app.modules.direcciones.models import DireccionEntrega
from app.modules.pedidos.models import Pedido, DetallePedido, HistorialEstadoPedido, FormaPago, EstadoPedido
from app.modules.pedidos.schemas import CrearPedidoRequest, AvanzarEstadoRequest
from app.modules.pedidos.unit_of_work import PedidoUoW


class PedidoService:
    def __init__(self, session: Session):
        self._session = session

    # Mapa FSM
    FSM = {
        "PENDIENTE": ["CONFIRMADO", "CANCELADO"],
        "CONFIRMADO": ["EN_PREP", "CANCELADO"],
        "EN_PREP": ["ENTREGADO", "CANCELADO"],
        "ENTREGADO": [],
        "CANCELADO": [],
    }

    def get_formas_pago(self) -> list[FormaPago]:
        """Retorna todas las formas de pago habilitadas."""
        with PedidoUoW(self._session) as uow:
            return uow.formas_pago.get_habilitados()

    def get_mis_pedidos(self, usuario_id: int, roles: list[str]) -> list[Pedido]:
        """
        Retorna los pedidos activos del usuario actual de manera estricta.
        """
        with PedidoUoW(self._session) as uow:
            pedidos = uow.pedidos.get_all_by_usuario(usuario_id)
            for pedido in pedidos:
                _ = pedido.detalles
                _ = pedido.historial
            return pedidos

    def get_pedidos_gestion(self) -> list[Pedido]:
        """
        Retorna todos los pedidos activos para vistas de administración/gestión.
        """
        with PedidoUoW(self._session) as uow:
            pedidos = uow.pedidos.get_all_active()
            for pedido in pedidos:
                _ = pedido.detalles
                _ = pedido.historial
            return pedidos

    def get_pedido(self, pedido_id: int, usuario_id: int, roles: list[str]) -> Pedido:
        """
        Retorna un pedido específico con sus detalles e historial.
        - Si es ADMIN/PEDIDOS, puede acceder a cualquiera.
        - Si es CLIENT, solo puede acceder si es el dueño del pedido.
        """
        with PedidoUoW(self._session) as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido or pedido.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido no encontrado"
                )

            is_admin_or_pedidos = "ADMIN" in roles or "PEDIDOS" in roles
            if not is_admin_or_pedidos and pedido.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permisos para ver este pedido"
                )

            # Cargar explícitamente relaciones para que queden en memoria tras el UoW
            _ = pedido.detalles
            _ = pedido.historial
            return pedido

    def crear(self, usuario_id: int, data: CrearPedidoRequest) -> Pedido:
        """
        Crea un nuevo pedido transaccional y reduce el stock de los productos.
        """
        if not data.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El pedido debe contener al menos un item"
            )

        with PedidoUoW(self._session) as uow:
            # 1. Validar forma de pago
            forma_pago = uow.formas_pago.get_by_id(data.forma_pago_codigo)
            if not forma_pago or not forma_pago.habilitado:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Forma de pago inválida o deshabilitada"
                )

            # 2. Validar dirección si se provee
            costo_envio = Decimal("0.00")
            if data.direccion_id is not None:
                # Comprobar dirección en DB
                direccion = self._session.get(DireccionEntrega, data.direccion_id)
                if not direccion or direccion.usuario_id != usuario_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Dirección de entrega inválida o no pertenece al usuario"
                    )
                costo_envio = Decimal("50.00")

            # 3. Procesar items, validar stock de ingredientes y calcular subtotal
            subtotal = Decimal("0.00")
            detalles_a_crear = []
            ingredientes_afectados_ids = set()

            from app.modules.productos.models import ProductoIngrediente
            from app.modules.ingredientes.models import Ingrediente
            from app.modules.productos.service import recalcular_producto_stock_y_precio

            for item in data.items:
                producto = self._session.get(Producto, item.producto_id)
                if not producto or not producto.disponible:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Producto con id={item.producto_id} no encontrado"
                    )

                # Obtener ingredientes de la receta del producto
                receta = self._session.exec(select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto.id)).all()

                if receta:
                    for pi in receta:
                        ingrediente = self._session.get(Ingrediente, pi.ingrediente_id)
                        if not ingrediente:
                            continue
                        
                        cantidad_necesaria = pi.cantidad * Decimal(str(item.cantidad))
                        if ingrediente.stock_actual < cantidad_necesaria:
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Stock insuficiente del ingrediente '{ingrediente.nombre}' para preparar '{producto.nombre}' (requerido: {cantidad_necesaria}, disponible: {ingrediente.stock_actual})"
                            )
                        
                        # Descontar stock del ingrediente
                        ingrediente.stock_actual -= cantidad_necesaria
                        self._session.add(ingrediente)
                        ingredientes_afectados_ids.add(ingrediente.id)
                else:
                    # Fallback para compatibilidad con productos sin receta (como en tests previos)
                    if producto.stock_cantidad < item.cantidad:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Stock insuficiente para el producto '{producto.nombre}' (disponible: {producto.stock_cantidad})"
                        )
                    producto.stock_cantidad -= item.cantidad
                    self._session.add(producto)

                # Calcular subtotal del detalle
                precio_snap = producto.precio_base
                subtotal_snap = precio_snap * Decimal(str(item.cantidad))
                subtotal += subtotal_snap

                detalle = DetallePedido(
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_snapshot=producto.nombre,
                    precio_snapshot=precio_snap,
                    subtotal_snap=subtotal_snap,
                    personalizacion=item.personalizacion
                )
                detalles_a_crear.append(detalle)

            # 4. Crear el pedido
            descuento = Decimal("0.00")
            total = subtotal - descuento + costo_envio

            pedido = Pedido(
                usuario_id=usuario_id,
                direccion_id=data.direccion_id,
                estado_codigo="PENDIENTE",
                forma_pago_codigo=data.forma_pago_codigo,
                subtotal=subtotal,
                descuento=descuento,
                costo_envio=costo_envio,
                total=total,
                notas=data.notas,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            uow.pedidos.add(pedido)
            uow.flush()  # Para obtener el ID del pedido

            # 5. Guardar detalles asociados
            for det in detalles_a_crear:
                det.pedido_id = pedido.id
                uow.detalles.add(det)

            # 6. Recalcular stock de productos afectados por la reducción de ingredientes
            uow.flush()
            productos_afectados = set()
            for ing_id in ingredientes_afectados_ids:
                pi_list = self._session.query(ProductoIngrediente).filter(
                    ProductoIngrediente.ingrediente_id == ing_id
                ).all()
                for pi in pi_list:
                    productos_afectados.add(pi.producto_id)
            
            for prod_id in productos_afectados:
                recalcular_producto_stock_y_precio(self._session, prod_id)

            # 7. Registrar historial de estado inicial (None -> PENDIENTE)
            historial = HistorialEstadoPedido(
                pedido_id=pedido.id,
                estado_desde=None,
                estado_hacia="PENDIENTE",
                usuario_id=usuario_id,
                motivo="Creación del pedido",
                created_at=datetime.utcnow()
            )
            uow.historial.add_entrada(historial)

        self._session.refresh(pedido)
        # Cargar relaciones explícitamente para el response
        _ = pedido.detalles
        _ = pedido.historial
        return pedido

    def avanzar_estado(self, pedido_id: int, usuario_id: Optional[int], roles: list[str], data: AvanzarEstadoRequest) -> Pedido:
        """
        Avanza o cambia el estado de un pedido validando la FSM, roles y devolviendo stock si se cancela.
        """
        with PedidoUoW(self._session) as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido or pedido.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido no encontrado"
                )

            estado_desde = pedido.estado_codigo
            estado_hacia = data.estado_hacia

            # 1. Validar FSM
            transiciones_validas = self.FSM.get(estado_desde, [])
            if estado_hacia not in transiciones_validas:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Transición inválida de {estado_desde} a {estado_hacia}"
                )

            is_admin_or_pedidos = "ADMIN" in roles or "PEDIDOS" in roles or usuario_id is None

            # 2. Validar Rol
            if not is_admin_or_pedidos:
                # Si es un cliente común, debe ser el dueño del pedido
                if pedido.usuario_id != usuario_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="No tienes permisos para modificar este pedido"
                    )
                # Un cliente solo puede CANCELAR
                if estado_hacia != "CANCELADO":
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Un cliente solo puede cancelar un pedido"
                    )
                # Un cliente solo puede cancelar si está en PENDIENTE o CONFIRMADO
                if estado_desde not in ["PENDIENTE", "CONFIRMADO"]:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="No se puede cancelar el pedido en este estado (ya en preparación o posterior)"
                    )

            # 3. Validar motivo si va a CANCELADO
            if estado_hacia == "CANCELADO":
                if not data.motivo or data.motivo.strip() == "":
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="El motivo de cancelación es obligatorio"
                    )

                # Devolver stock a los ingredientes o productos si devolver_stock es True
                if data.devolver_stock:
                    from app.modules.productos.models import ProductoIngrediente
                    from app.modules.ingredientes.models import Ingrediente
                    from app.modules.productos.service import recalcular_producto_stock_y_precio

                    ingredientes_modificados = set()
                    for det in pedido.detalles:
                        receta = self._session.exec(select(ProductoIngrediente).where(ProductoIngrediente.producto_id == det.producto_id)).all()
                        if receta:
                            for pi in receta:
                                ingrediente = self._session.get(Ingrediente, pi.ingrediente_id)
                                if ingrediente:
                                    cantidad_a_devolver = pi.cantidad * Decimal(str(det.cantidad))
                                    ingrediente.stock_actual += cantidad_a_devolver
                                    self._session.add(ingrediente)
                                    ingredientes_modificados.add(ingrediente.id)
                        else:
                            # Fallback para productos sin receta (compatibilidad con tests antiguos)
                            producto = self._session.get(Producto, det.producto_id)
                            if producto:
                                producto.stock_cantidad += det.cantidad
                                self._session.add(producto)
                    
                    # Flush e invalidación/recalculación de stock de productos afectados
                    self._session.flush()
                    
                    if ingredientes_modificados:
                        productos_afectados = set()
                        for ing_id in ingredientes_modificados:
                            pi_list = self._session.query(ProductoIngrediente).filter(
                                ProductoIngrediente.ingrediente_id == ing_id
                            ).all()
                            for pi in pi_list:
                                productos_afectados.add(pi.producto_id)
                                
                        for prod_id in productos_afectados:
                            recalcular_producto_stock_y_precio(self._session, prod_id)

            # 4. Actualizar pedido
            pedido.estado_codigo = estado_hacia
            pedido.updated_at = datetime.utcnow()
            uow.pedidos.add(pedido)

            # 5. Registrar historial
            historial = HistorialEstadoPedido(
                pedido_id=pedido.id,
                estado_desde=estado_desde,
                estado_hacia=estado_hacia,
                usuario_id=usuario_id,
                motivo=data.motivo,
                created_at=datetime.utcnow()
            )
            uow.historial.add_entrada(historial)

        self._session.refresh(pedido)
        _ = pedido.detalles
        _ = pedido.historial

        # Emitir evento WebSocket post-commit
        try:
            from app.core.ws_manager import ws_manager
            event_payload = {
                "event": "ORDER_STATE_CHANGED",
                "pedido_id": pedido.id,
                "estado_codigo": pedido.estado_codigo,
                "usuario_id": pedido.usuario_id,
                "motivo": data.motivo or ""
            }
            ws_manager.broadcast_sync(f"pedido_{pedido.id}", event_payload)
            ws_manager.broadcast_sync(f"user_{pedido.usuario_id}", event_payload)
            ws_manager.broadcast_sync("admin", event_payload)
        except Exception as e:
            # Capturamos cualquier error para evitar que el fallo del WebSocket rompa la respuesta HTTP exitosa
            print(f"Error al emitir eventos WebSocket post-commit: {e}")

        return pedido
