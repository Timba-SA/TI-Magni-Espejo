# Technical Design: Formulario Complejo y Gestión de Stock de Ingredientes (032-formulario-complejo-ingredientes)

Este documento describe las especificaciones técnicas y de arquitectura para la implementación de campos complejos en el módulo de Ingredientes.

---

## 1. Backend Architecture

### Modificaciones en Modelos (SQLModel)
Agregaremos los campos en `backend/app/modules/ingredientes/models.py`. 
Para evitar errores con datos existentes, usaremos valores por defecto en la base de datos y tipados decimales seguros:

```python
from decimal import Decimal
from sqlalchemy import Column, Numeric
# ...

class Ingrediente(SQLModel, table=True):
    # ...
    unidad_medida_id: Optional[int] = Field(
        default=None, 
        foreign_key="unidades_medida.id", 
        nullable=True
    )
    stock_actual: Decimal = Field(
        default=Decimal("0.000"),
        sa_column=Column(Numeric(precision=10, scale=3), nullable=False, server_default="0.000")
    )
    stock_minimo: Decimal = Field(
        default=Decimal("0.000"),
        sa_column=Column(Numeric(precision=10, scale=3), nullable=False, server_default="0.000")
    )
    costo_unitario: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=Column(Numeric(precision=10, scale=2), nullable=False, server_default="0.00")
    )

    # Relación de sólo lectura con UnidadMedida
    unidad_medida: Optional["UnidadMedida"] = Relationship()
```

### Relación Dinámica y selectinload
En `backend/app/modules/ingredientes/repository.py` y `service.py`, al listar o consultar ingredientes, utilizaremos `selectinload(Ingrediente.unidad_medida)` para cargar la unidad de medida en una sola query optimizada.

### Migración Automática de Base de Datos
En `backend/app/core/database.py` o al inicializar, ejecutaremos sentencias `ALTER TABLE` controladas para SQLite a fin de añadir las columnas si no existieran, previniendo fallas de base de datos sin alterar los datos reales:
```python
def migrate_ingredientes_columns(session):
    # Ejecutar PRAGMA table_info(ingredientes) y ALTER TABLE si no existen
```

---

## 2. Frontend Architecture

### Tipados de TypeScript
Expandimos la interfaz de `Ingrediente` en `frontend/src/features/insumos/types/insumo.types.ts`:

```typescript
export interface Ingrediente {
  id: number;
  nombre: string;
  descripcion: string | null;
  es_alergeno: boolean;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Nuevos campos
  unidad_medida_id: number | null;
  stock_actual: number;
  stock_minimo: number;
  costo_unitario: number;
  unidad_medida?: {
    id: number;
    nombre: string;
    simbolo: string;
    tipo: string;
  } | null;
}
```

### Dropdown Dinámico de Unidades de Medida
- Añadiremos una llamada a `GET /api/v1/unidades-medida/` en el servicio del front.
- En `InsumoForm.tsx`, cargamos este catálogo al renderizar y poblamos un `<select>` estilizado de Tailwind v4.

### Rediseño de UI Premium del Formulario
El formulario pasará a un diseño translúcido de dos columnas con fondos en vidrio:
- **Columna Izquierda (General)**:
  - Nombre (obligatorio, longitud min/max).
  - Descripción (opcional, textarea corto).
  - Checkbox interactivo "Es alérgeno" con animaciones suaves de hover.
- **Columna Derecha (Inventario & Medidas)**:
  - Selector de Unidad de Medida.
  - Stock Actual (número decimal, `>= 0`).
  - Stock Mínimo (límite de alerta, `>= 0`).
  - Costo Unitario (precio de compra, `>= 0`).

### Grid y Alertas en Tabla
En `InsumosTable.tsx`:
- Mostraremos la cantidad del ingrediente combinando `stock_actual` y `unidad_medida?.simbolo` (ej: `45.500 kg`).
- Lógica de Alerta de Stock Bajo:
  ```typescript
  const esCritico = ingrediente.stock_actual <= ingrediente.stock_minimo;
  ```
  Si `esCritico` es verdadero y `stock_minimo > 0`, se muestra una etiqueta animada `Stock Crítico` con fondo ámbar degradado y texto vibrante, además de pintar el número en rojo/naranja.
