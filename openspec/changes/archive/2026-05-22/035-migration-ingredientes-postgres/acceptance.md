# Acceptance: 035 — Corrección de Migración de Ingredientes en PostgreSQL

Este documento contiene los criterios de aceptación requeridos para considerar resuelto el problema de la migración de ingredientes en PostgreSQL.

## Criterios de Aceptación

1. **Agnosticismo de Base de Datos:**
   - La función `migrate_ingredientes_columns()` en `backend/app/core/database.py` no debe invocar comandos SQL que sean específicos de SQLite (como `PRAGMA table_info`).
   - La detección de columnas existentes debe realizarse utilizando `inspect` de SQLAlchemy.

2. **Migración en PostgreSQL:**
   - Al iniciar la aplicación en el contenedor Docker (`food_store_backend`), la migración debe ejecutarse sin errores sobre la base de datos PostgreSQL (`food_store_db`).
   - Las columnas `unidad_medida_id`, `stock_actual`, `stock_minimo`, `costo_unitario` deben ser añadidas a la tabla `ingredientes` en la base de datos PostgreSQL si no existen previamente.

3. **Verificación de Tests:**
   - Los tests existentes en `backend/tests/test_ingredientes_inventario.py` deben ejecutarse y pasar correctamente usando la base de datos SQLite en memoria.

4. **Operabilidad del Frontend:**
   - La creación de ingredientes a través del formulario de administración debe responder con un estado exitoso (`201 Created`) en lugar de arrojar un error de red o de servidor (`Failed to fetch`/`500 Internal Server Error`).
