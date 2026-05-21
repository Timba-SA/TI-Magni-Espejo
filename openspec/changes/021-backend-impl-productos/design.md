# Technical Design: UnidadMedida y Actualización de Modelos de Catálogo

Este diseño detalla los cambios estructurales en la base de datos (usando SQLModel) y las capas de la aplicación necesarias para soportar la estandarización de unidades de medida en el catálogo de productos.

## 1. Cambios en el Modelo de Base de Datos (SQLModel)

### [NUEVO] `UnidadMedida`
Agregaremos la clase `UnidadMedida` en `backend/app/modules/productos/models.py` (o en su propio archivo si crece, pero inicialmente en `models.py` del módulo de productos para mantener el Dominio 2 cohesionado):

```python
class UnidadMedida(SQLModel, table=True):
    __tablename__ = "unidades_medida"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=50, nullable=False, sa_column_kwargs={"unique": True})
    simbolo: str = Field(max_length=10, nullable=False, sa_column_kwargs={"unique": True})
    tipo: str = Field(max_length=20, nullable=False) # masa | volumen | unidad | area

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

### [MODIFICAR] `Producto` (`backend/app/modules/productos/models.py`)
Agregaremos la clave foránea `unidad_venta_id` apuntando a `unidades_medida.id`:

```python
class Producto(SQLModel, table=True):
    # ... campos existentes ...
    
    unidad_venta_id: Optional[int] = Field(
        default=None,
        foreign_key="unidades_medida.id",
        nullable=True,
    )
    
    # Relationships
    unidad_venta: Optional[UnidadMedida] = Relationship()
```

### [MODIFICAR] `ProductoIngrediente` (`backend/app/modules/productos/models.py`)
Agregaremos los campos `cantidad` y `unidad_medida_id` para definir con precisión la porción en la receta:

```python
class ProductoIngrediente(SQLModel, table=True):
    # ... llaves primarias compuestas existentes ...
    
    cantidad: Decimal = Field(
        decimal_places=3,
        max_digits=10,
        nullable=False,
        default=0.000,
    )
    unidad_medida_id: int = Field(
        foreign_key="unidades_medida.id",
        nullable=False,
    )

    # Relationships
    unidad_medida: Optional[UnidadMedida] = Relationship()
```

---

## 2. Puntos de Entrada y Control (FastAPI Layer)

### Schemas (`backend/app/modules/productos/schemas.py`)
*   **`UnidadMedidaRead`:** Para retornar los datos de la unidad.
*   **`UnidadMedidaCreate` / `UnidadMedidaUpdate`:** Para la administración del catálogo de unidades.
*   **Actualización de `ProductoRead`:** Debe incluir el objeto `unidad_venta` anidado o su ID para que el frontend renderice la leyenda correcta (ej: "kg").
*   **Actualización de `ProductoIngredienteRead`:** Debe incluir la porción (`cantidad`) y la unidad física de medida en formato legible.

### Módulo de Servicios y Repositorios
*   **`UnidadMedidaRepository` & `UnidadMedidaService`:** Implementación estándar de CRUD con Unit of Work para que el administrador pueda registrar nuevas unidades de medida desde el panel.
*   **Actualización de `ProductoService`:** Modificar la lógica de creación/edición de productos para validar que `unidad_venta_id` y `unidad_medida_id` existan en la base de datos antes de persistir los cambios (evitando inconsistencias de FK en la DB).

---

## 3. Semilla de Datos (Seeds)
Actualizaremos `backend/app/db/seed.py` (o el cargador de semillas) para poblar las unidades de medida básicas al iniciar el entorno de desarrollo y pruebas:

*   **Masa:** `Kilogramo (kg)`, `Gramo (g)`
*   **Volumen:** `Litro (L)`, `Mililitro (mL)`
*   **Unidad:** `Pieza (u)`, `Docena (doc)`
*   **Área:** `Metro cuadrado (m²)`

Esto garantiza que las pruebas automatizadas (Strict TDD) corran en un entorno consistente.
