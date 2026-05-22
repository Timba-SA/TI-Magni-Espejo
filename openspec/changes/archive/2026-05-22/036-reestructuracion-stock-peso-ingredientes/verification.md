# Verificación: Reestructuración de Stock, Peso y Gestión de Inactivos en Ingredientes (036)

Hemos validado con total éxito las especificaciones del cambio.

## Pruebas Automatizadas

Se corrió la suite de integración completa del backend en el entorno Docker:
```bash
docker compose exec backend sh -c "PYTHONPATH=. pytest"
```

**Resultado:**
- **58 passed (100% exitoso) ✅.**
- Los tests para la suite de ingredientes (`test_ingredientes_inventario.py`) pasaron todos sin problemas (7/7 tests exitosos, incluyendo el escenario de baja lógica y ocultamiento en `test_eliminar_ingrediente_hace_soft_delete_y_oculta`).

## Pruebas Manuales y Verificación Visual

1. **Formatos de Stock y Peso en UI**:
   - Se validó que el Stock Actual y Mínimo en `InsumosTable` y `InsumoDetailModal` se rendericen sin ceros decimales fijos (ej: `5 u` en lugar de `5.000 u`).
   - Se comprobó que el Peso de los insumos se renderice con exactamente 1 decimal después del punto (ej: `1.5 kg` o `1.0 kg` en lugar de `1.500 kg`).
2. **Soft Delete y Ocultación**:
   - Al inhabilitar o eliminar un ingrediente, este desaparece inmediatamente del listado normal.
   - Al marcar "Mostrar inactivos", el ingrediente aparece opaco (con `opacity-60`) y tiene la insignia de "Inactivo".
   - El diálogo de confirmación de eliminación (`ConfirmDeleteModal`) fue actualizado para indicar que se "inhabilitará de la lista de activos" en lugar de borrarse de manera permanente del sistema.
3. **Limpieza de Datos**:
   - Se limpió el ingrediente antiguo (`Costillas de vaca` con ID 1) que no correspondía al usuario de pruebas actual.
