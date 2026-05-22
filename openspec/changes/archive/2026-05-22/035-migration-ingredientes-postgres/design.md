# Design: 035 — Corrección de Migración de Ingredientes en PostgreSQL

Este documento describe la propuesta técnica para solucionar el problema de migración en PostgreSQL mediante una inspección agnóstica de bases de datos.

## Enfoque Técnico

Utilizaremos la utilidad `inspect` de SQLAlchemy para consultar de forma segura los metadatos de la tabla `ingredientes` en la base de datos conectada en tiempo de ejecución. 

### Cambios Propuestos

#### [MODIFY] [database.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/core/database.py)

Reemplazar la lógica de consulta de columnas en `migrate_ingredientes_columns()` para evitar el uso del comando SQLite `PRAGMA table_info`.

**Antes:**
```python
def migrate_ingredientes_columns():
    from sqlalchemy import text
    with engine.begin() as conn:
        # Consultar las columnas existentes en la tabla ingredientes
        res = conn.execute(text("PRAGMA table_info(ingredientes)")).fetchall()
        columnas = {row[1] for row in res}
        ...
```

**Después:**
```python
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
        ...
```

Esta solución es robusta porque:
1. `inspect(engine)` abstrae la base de datos de destino. Funciona igual si el motor se conecta a SQLite (para tests) o a PostgreSQL (en Docker).
2. Comprobamos la existencia de la tabla antes de inspeccionarla para evitar excepciones durante el arranque inicial.
3. El uso de `ALTER TABLE` es compatible con el dialecto de PostgreSQL y SQLite para añadir columnas.

## Riesgos y Alternativas

- **Riesgo:** Si la tabla `ingredientes` se recrea de cero, `SQLModel.metadata.create_all(engine)` se ejecuta primero, creando la tabla con el esquema actualizado. En ese caso, la función `migrate_ingredientes_columns()` no hará nada porque todas las columnas ya existirán.
- **Alternativa:** Usar Alembic para migraciones.
  - *Tradeoff:* Alembic requiere configurar archivos adicionales, generar scripts de migración y ejecutar comandos en el contenedor. Dado que el proyecto ya cuenta con una función de migración manual simple en `database.py` y no tiene Alembic inicializado en absoluto, corregir la función de migración es la opción más directa, limpia y libre de riesgos para mantener la compatibilidad con el resto del codebase.
