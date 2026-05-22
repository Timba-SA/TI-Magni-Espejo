# Proposal: 035 — Corrección de Migración de Ingredientes en PostgreSQL

## Problema

Al intentar crear un nuevo ingrediente en el modal de administración, el backend arroja un error `500` con el mensaje `sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedColumn) column ingredientes.unidad_medida_id does not exist` y en el frontend se muestra un error general "Failed to fetch".

### Causa Raíz

En `backend/app/core/database.py`, la función de migración manual `migrate_ingredientes_columns()` utiliza la consulta `PRAGMA table_info(ingredientes)`. Esta es una sintaxis específica de SQLite. Cuando el backend se ejecuta en el contenedor de Docker apuntando a la base de datos de producción/desarrollo en PostgreSQL, esta consulta falla silenciosamente (o es capturada por el try-except en `create_db_and_tables`) y la columna `unidad_medida_id` (y otras columnas añadidas en el change 032) nunca se crean en la base de datos Postgres persistida.

## Propuesta de Solución

1. **Migración agnóstica de base de datos:**
   Reemplazar el uso de `PRAGMA table_info` de SQLite en `backend/app/core/database.py` por la API de inspección estándar de SQLAlchemy (`sqlalchemy.inspect`), la cual funciona de forma idéntica en SQLite, PostgreSQL, MySQL y cualquier base de datos.
   
2. **Ejecución y Verificación:**
   - La nueva función consultará las columnas existentes usando `inspect(engine).get_columns("ingredientes")`.
   - Si detecta que faltan las columnas necesarias (`unidad_medida_id`, `stock_actual`, `stock_minimo`, `costo_unitario`), ejecutará sentencias `ALTER TABLE` nativas de SQL que son compatibles con PostgreSQL y SQLite.
   - Probar que los tests de backend pasen correctamente (SQLite).
   - Reiniciar el contenedor del backend para que ejecute la migración en la base de datos de PostgreSQL de Docker.
