# Diseño Técnico: Reestructuración de Stock, Peso y Gestión de Inactivos para Ingredientes

Este diseño detalla los cambios estructurales en la base de datos, API y frontend para redefinir el stock en unidades, agregar la columna `peso` y mejorar la gestión de ingredientes inactivos.

## 1. Arquitectura y Base de Datos

### Modificaciones de Schema (SQLModel)
En [models.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/models.py):
- Se añade el campo `peso` al modelo `Ingrediente`:
```python
    peso: Optional[Decimal] = Field(
        default=None,
        sa_column=Column(
            Numeric(precision=10, scale=3),
            nullable=True,
            server_default=None,
        ),
    )
```

### Migración Automática
En [database.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/core/database.py):
- Se mantiene `migrate_ingredientes_columns()` para incorporar la migración del campo `peso` mediante SQL directo.

## 2. Cambios en Backend

### Esquemas (Pydantic)
En [schemas.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/schemas.py):
- `IngredienteCreate` e `IngredienteUpdate`: agregar `peso: Optional[Decimal] = None`.
- `IngredienteRead`: agregar `peso: Optional[Decimal] = None`.

### Repositorio
En [repository.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/repository.py):
- Modificar `list_with_filters` para que el listado activo por defecto filtre ingredientes que cumplan: `Ingrediente.is_active == True` y `Ingrediente.deleted_at == None`.
- Si `incluir_inactivos` es `True`, se desactiva este filtro (trae activos, inactivos y eliminados lógicamente).
```python
    def list_with_filters(
        self,
        nombre: Optional[str] = None,
        es_alergeno: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
        incluir_inactivos: bool = False,
    ) -> tuple[list[Ingrediente], int]:
        base = select(Ingrediente)
        if not incluir_inactivos:
            base = base.where(
                Ingrediente.is_active == True,
                Ingrediente.deleted_at == None
            )
```

### Servicio
En [service.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/service.py):
- Modificar `eliminar`:
  - Además de invocar a `uow.ingredientes.soft_delete(obj)` (que setea `deleted_at`), cambiar `obj.is_active = False` para que la inactivación y el borrado lógico queden sincronizados.
- Modificar `toggle_active`:
  - Si `obj.is_active` pasa a ser `False` (desactivar), seteamos `obj.deleted_at = datetime.now(timezone.utc)`.
  - Si `obj.is_active` pasa a ser `True` (activar), seteamos `obj.deleted_at = None`.

---

## 3. Cambios en Frontend

### Definición de Tipos
En [insumo.types.ts](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/types/insumo.types.ts):
- Modificar `Ingrediente` e `IngredienteFormData` para soportar `peso: number | null`.
- Modificar `IngredienteFiltersState` para incluir `mostrarInactivos: boolean`.

### Servicio
En [insumosService.ts](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/services/insumosService.ts):
- Modificar `getInsumos` para pasar `incluir_inactivos` a la API.

### Componentes de Interfaz

1. **Tabla de Insumos (`InsumosTable.tsx`)**:
   - Agregar columna **Peso** al lado de Stock Actual.
   - Mostrar el Peso usando la unidad de medida real de cada ingrediente formateado a **1 decimal después del punto** (ej. `Number(insumo.peso).toFixed(1) kg`).
   - Mostrar el stock con la unidad fija `u` (unidades) formateado **sin ceros decimales fijos** (usando `Number(insumo.stock_actual)`).
   - Cambiar visualización de Costo Unitario a `/ u`.
   - Si `insumo.is_active === false` o `insumo.deleted_at !== null`, aplicar clase CSS `opacity-60` a la fila entera.
   - Mantener únicamente el botón tradicional de Eliminar (que llama a `onDelete` para soft delete).

2. **Formulario (`InsumoForm.tsx`)**:
   - Agregar un input numérico para **Peso**.
   - Colocar una etiqueta dinámica al lado de Peso indicando la unidad de medida seleccionada (ej: `Peso (kg)`, `Peso (g)`).

3. **Filtros (`InsumoFilters.tsx`)**:
   - Agregar un botón/toggle que alterne `mostrarInactivos`.

4. **Modal de Detalle (`InsumoDetailModal.tsx`)**:
   - Mostrar el stock y stock mínimo sin ceros decimales adicionales (`Number()`).
   - Mostrar el peso formateado con un solo decimal después del punto (`.toFixed(1)`).
   - Si el ingrediente está inactivo o borrado lógico, mostrar la fila **Fecha de Desactivación** formateada.

