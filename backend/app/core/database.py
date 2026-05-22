from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Usa DATABASE_URL si está definida, sino construye la URL a partir de las variables individuales
engine = create_engine(settings.database_url, echo=True)


def migrate_ingredientes_columns():
    from sqlalchemy import text, inspect
    
    inspector = inspect(engine)
    if not inspector.has_table("ingredientes"):
        return
        
    columnas = {col["name"] for col in inspector.get_columns("ingredientes")}
    
    with engine.begin() as conn:
        if "unidad_medida_id" not in columnas:
            try:
                conn.execute(text("ALTER TABLE ingredientes ADD COLUMN unidad_medida_id INTEGER"))
            except Exception as e:
                print(f"Error migrando unidad_medida_id: {e}")
                
        if "stock_actual" not in columnas:
            try:
                conn.execute(text("ALTER TABLE ingredientes ADD COLUMN stock_actual NUMERIC(10,3) NOT NULL DEFAULT '0.000'"))
            except Exception as e:
                print(f"Error migrando stock_actual: {e}")
                
        if "stock_minimo" not in columnas:
            try:
                conn.execute(text("ALTER TABLE ingredientes ADD COLUMN stock_minimo NUMERIC(10,3) NOT NULL DEFAULT '0.000'"))
            except Exception as e:
                print(f"Error migrando stock_minimo: {e}")
                
        if "costo_unitario" not in columnas:
            try:
                conn.execute(text("ALTER TABLE ingredientes ADD COLUMN costo_unitario NUMERIC(10,2) NOT NULL DEFAULT '0.00'"))
            except Exception as e:
                print(f"Error migrando costo_unitario: {e}")


def create_db_and_tables():
    # Importar todos los modelos para registrarlos en SQLModel.metadata
    from app.modules.auth.models import Rol, UsuarioRol, RefreshToken
    from app.modules.categorias.models import Categoria
    from app.modules.direcciones.models import DireccionEntrega
    from app.modules.ingredientes.models import Ingrediente
    from app.modules.pagos.models import Pago
    from app.modules.pedidos.models import EstadoPedido, FormaPago, Pedido, DetallePedido, HistorialEstadoPedido
    from app.modules.productos.models import UnidadMedida, ProductoCategoria, ProductoIngrediente, Producto
    from app.modules.usuarios.models import Usuario

    SQLModel.metadata.create_all(engine)
    try:
        migrate_ingredientes_columns()
    except Exception as e:
        print(f"Error al correr la migración manual de ingredientes: {e}")


def get_session():
    with Session(engine) as session:
        yield session
