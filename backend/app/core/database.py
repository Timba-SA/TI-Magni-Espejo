from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Usa DATABASE_URL si está definida, sino construye la URL a partir de las variables individuales
engine = create_engine(settings.database_url, echo=True)


def migrate_ingredientes_columns():
    from sqlalchemy import text
    with engine.begin() as conn:
        # Consultar las columnas existentes en la tabla ingredientes
        res = conn.execute(text("PRAGMA table_info(ingredientes)")).fetchall()
        columnas = {row[1] for row in res}
        
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
    SQLModel.metadata.create_all(engine)
    try:
        migrate_ingredientes_columns()
    except Exception as e:
        print(f"Error al correr la migración manual de ingredientes: {e}")


def get_session():
    with Session(engine) as session:
        yield session
