# Tasks: 035 — Corrección de Migración de Ingredientes en PostgreSQL

## Tareas de Implementación

- [x] T-01: Modificar `backend/app/core/database.py` para usar `sqlalchemy.inspect` en lugar de `PRAGMA table_info`.
- [x] T-02: Ejecutar los tests de backend en SQLite para asegurar que no se rompe la base de datos de test y que las columnas se migran bien en local.
- [x] T-03: Reiniciar el contenedor de Docker `food_store_backend` para forzar la inicialización y migración automática de la base de datos PostgreSQL.
- [x] T-04: Verificar que el modal de "Nuevo ingrediente" en la UI web funcione y cree ingredientes sin arrojar el error "Failed to fetch".
