from app.modules.insumos.models import InsumoModel
from app.modules.insumos.schemas import InsumoResponse

def to_insumo_response(insumo: InsumoModel) -> InsumoResponse:
    stock_bajo = insumo.stock_actual <= insumo.stock_minimo
    valor_stock = insumo.stock_actual * insumo.precio_unitario
    
    return InsumoResponse(
        id=insumo.id,
        nombre=insumo.nombre,
        descripcion=insumo.descripcion,
        categoria=insumo.categoria,
        unidadMedida=insumo.unidad_medida,
        stockActual=insumo.stock_actual,
        stockMinimo=insumo.stock_minimo,
        precioUnitario=insumo.precio_unitario,
        estado=insumo.estado,
        fechaAlta=insumo.fecha_alta,
        fechaActualizacion=insumo.fecha_actualizacion,
        stockBajo=stock_bajo,
        valorStock=valor_stock
    )
