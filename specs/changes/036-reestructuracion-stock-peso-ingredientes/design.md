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
- Se actualiza `migrate_ingredientes_columns()` para incorporar la migración del campo `peso` mediante SQL directo (soportando tanto SQLite como PostgreSQL):
```python
        if "peso" not in columnas:
            try:
                conn.execute(text("ALTER TABLE ingredientes ADD COLUMN peso NUMERIC(10,3) DEFAULT NULL"))
            except Exception as e:
                print(f"Error migrando peso: {e}")
```

## 2. Cambios en Backend

### Esquemas (Pydantic)
En [schemas.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/schemas.py):
- `IngredienteCreate` e `IngredienteUpdate`: agregar `peso: Optional[Decimal] = None`.
- `IngredienteRead`: agregar `peso: Optional[Decimal] = None`.

### Repositorio
En [repository.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/repository.py):
- Modificar `list_with_filters` para recibir `incluir_inactivos: bool = False`:
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
            base = base.where(Ingrediente.is_active == True)
        else:
            base = base.where(Ingrediente.deleted_at == None) # En caso de que quisiéramos ocultar eliminados lógicos de verdad, o no filtrar nada. Soportaremos traer todos los no eliminados permanentes.
```

### Servicio
En [service.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/service.py):
- Modificar `listar` para recibir e inyectar `incluir_inactivos` en el repositorio.
- Modificar `toggle_active`:
  - Si `obj.is_active` pasa a ser `False` (desactivar), seteamos `obj.deleted_at = datetime.now(timezone.utc)`.
  - Si `obj.is_active` pasa a ser `True` (activar), seteamos `obj.deleted_at = None`.
- Modificar `exportar` para que:
  - Pase `incluir_inactivos=True` en `list_with_filters`.
  - Agregue las columnas `Peso`, `Estado` e `Historial de Desactivación` (mapeando `deleted_at`).

### Rutas
En [router.py](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/backend/app/modules/ingredientes/router.py):
- Modificar `listar_ingredientes` para recibir `incluir_inactivos: bool = Query(False, description="Incluir ingredientes inactivos")` y pasarlo al servicio.

---

## 3. Cambios en Frontend

### Definición de Tipos
En [insumo.types.ts](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/types/insumo.types.ts):
- Modificar `Ingrediente` e `IngredienteFormData` para soportar `peso: number | null`.
- Modificar `IngredienteFiltersState` para incluir `mostrarInactivos: boolean`.

### Servicio
En [insumosService.ts](file:///c:/Users/Lauti/OneDrive/Escritorio/TI-Magni/frontend/src/features/insumos/services/insumosService.ts):
- Modificar `getInsumos` para pasar `incluir_inactivos` a la API.
- Modificar `createInsumo` y `updateInsumo` para enviar el campo `peso`.
- Modificar `exportarIngredientes` para permitir exportar inactivos.

### Componentes de Interfaz

1. **Tabla de Insumos (`InsumosTable.tsx`)**:
   - Agregar columna **Peso** al lado de Stock Actual.
   - Mostrar el Peso usando la unidad de medida real de cada ingrediente (ej. `0.500 kg`).
   - Mostrar el stock con la unidad fija `u` (unidades) y el costo unitario por unidad (`$ / u`).
   - Si `insumo.is_active === false`, aplicar clase CSS `opacity-60` a la fila entera.

2. **Formulario (`InsumoForm.tsx`)**:
   - Agregar un input numérico para **Peso**.
   - Colocar una etiqueta dinámica al lado de Peso indicando la unidad de medida seleccionada (ej: `Peso (kg)`, `Peso (g)`), o mostrar "u" si no hay seleccionada.

3. **Filtros (`InsumoFilters.tsx`)**:
   - Agregar un botón/toggle que alterne `mostrarInactivos`.

4. **Modal de Detalle (`InsumoDetailModal.tsx`)**:
   - Agregar la fila **Peso** mostrando la cantidad y símbolo de medida.
   - Si el ingrediente está inactivo, mostrar la fila **Fecha de Desactivación** formateada.
