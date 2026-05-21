# Diseño Técnico del Cambio: Dashboard de Métricas
**ID del Cambio:** 026-backend-impl-admin-metrics
**Contexto:** Dashboard de Métricas Administrativas (Backend)

---

## 1. API Contract (Endpoints)

### `GET /api/v1/admin/dashboard/metrics`
- **Permisos:** Requiere token Bearer con rol `ADMIN`.
- **Query Params:**
  - `fecha_inicio`: `str | None` (Opcional, formato `YYYY-MM-DD`).
  - `fecha_fin`: `str | None` (Opcional, formato `YYYY-MM-DD`).
- **Response:** `200 OK` con un esquema `DashboardMetricsResponse`.

---

## 2. Esquemas de Pydantic (`backend/app/modules/admin/schemas.py`)

Definiremos los esquemas para estructurar de manera robusta la respuesta del endpoint de métricas:

```python
from pydantic import BaseModel, Field
from decimal import Decimal
from typing import list, dict
from datetime import date

class MetricKPICards(BaseModel):
    ingresos_totales: Decimal = Field(..., description="Suma de montos de pedidos entregados o confirmados")
    cantidad_pedidos: int = Field(..., description="Volumen de pedidos confirmados/entregados")
    ticket_promedio: Decimal = Field(..., description="Monto promedio por pedido")
    clientes_activos: int = Field(..., description="Cantidad de usuarios únicos que realizaron al menos un pedido")

class ProductoVendidoResponse(BaseModel):
    producto_id: int
    nombre: str
    cantidad_vendida: int
    ingresos_generados: Decimal

class ClienteMasCompradorResponse(BaseModel):
    usuario_id: int
    nombre_completo: str
    email: str
    cantidad_pedidos: int
    total_gastado: Decimal

class DistribucionPedidosResponse(BaseModel):
    estado_codigo: str
    cantidad: int

class VentaTemporalResponse(BaseModel):
    fecha: str  # Formato YYYY-MM-DD
    ingresos: Decimal
    cantidad_pedidos: int

class DashboardMetricsResponse(BaseModel):
    kpis: MetricKPICards
    productos_mas_vendidos: list[ProductoVendidoResponse]
    clientes_mas_compradores: list[ClienteMasCompradorResponse]
    distribucion_pedidos: list[DistribucionPedidosResponse]
    ventas_por_fecha: list[VentaTemporalResponse]
```

---

## 3. Mock del JSON Response

```json
{
  "kpis": {
    "ingresos_totales": 125400.50,
    "cantidad_pedidos": 84,
    "ticket_promedio": 1492.86,
    "clientes_activos": 32
  },
  "productos_mas_vendidos": [
    {
      "producto_id": 1,
      "nombre": "Pizza Muzza",
      "cantidad_vendida": 142,
      "ingresos_generados": 28400.00
    },
    {
      "producto_id": 5,
      "nombre": "Empanada de Carne",
      "cantidad_vendida": 98,
      "ingresos_generados": 9800.00
    }
  ],
  "clientes_mas_compradores": [
    {
      "usuario_id": 14,
      "nombre_completo": "Juan Perez",
      "email": "juan.perez@email.com",
      "cantidad_pedidos": 12,
      "total_gastado": 18450.00
    }
  ],
  "distribucion_pedidos": [
    {
      "estado_codigo": "ENTREGADO",
      "cantidad": 72
    },
    {
      "estado_codigo": "PENDIENTE",
      "cantidad": 8
    },
    {
      "estado_codigo": "CANCELADO",
      "cantidad": 4
    }
  ],
  "ventas_por_fecha": [
    {
      "fecha": "2026-05-19",
      "ingresos": 4200.00,
      "cantidad_pedidos": 3
    },
    {
      "fecha": "2026-05-20",
      "ingresos": 8500.50,
      "cantidad_pedidos": 6
    }
  ]
}
```

---

## 4. Diseño de Consultas y Lógica de Negocio (`backend/app/modules/admin/service.py`)

Para garantizar la máxima performance en base de datos SQLite y Postgres (producción) y evitar consultas N+1, la agregación de métricas se realizará mediante consultas selectivas de SQLModel/SQLAlchemy:

1. **Lógica Temporal:**
   - Si no se provee `fecha_inicio` ni `fecha_fin`, la lógica temporal filtrará los registros por defecto desde hace 30 días (`datetime.utcnow() - timedelta(days=30)`).
2. **Consultas a SQLModel:**
   - **Pedidos:** Consultar todos los pedidos entre las fechas especificadas que no estén eliminados (`deleted_at is None`).
   - **Exclusión de Cancelados en KPIs Financieros:** Para el cálculo de `ingresos_totales` y `ticket_promedio`, se sumará el `total` de pedidos que tengan estados válidos (por ejemplo, aquellos que no estén en estado `CANCELADO`).
   - **Ranking de Productos:** Se consultará la tabla `detalles_pedido`, uniendo con `pedidos` (para el filtro de fechas y soft delete), agrupando por `producto_id` y ordenando descendentemente por la suma de `cantidad` para obtener el Top 5/10.
   - **Ranking de Clientes:** Se consultará la tabla `pedidos`, agrupando por `usuario_id`, sumando el `total` de pedidos, uniendo con `usuarios` para extraer su nombre y apellido, y ordenando descendentemente por monto total.
   - **Distribución de Estados:** Agrupamiento de pedidos por `estado_codigo` y recuento de los mismos en el rango de fechas.
