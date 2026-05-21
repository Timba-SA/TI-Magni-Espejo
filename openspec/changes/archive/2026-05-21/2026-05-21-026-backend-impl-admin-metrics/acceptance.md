# Criterios de Aceptación (Acceptance)
**ID del Cambio:** 026-backend-impl-admin-metrics
**Contexto:** Dashboard de Métricas Administrativas (Backend)

---

## Escenarios de Aceptación

### Escenario 1: Consulta de Métricas Exitosa (Rol ADMIN)
- **Dado que** un usuario está autenticado en el sistema y posee el rol `ADMIN`.
- **Cuando** realiza una solicitud HTTP `GET /api/v1/admin/dashboard/metrics`.
- **Entonces** la API debe responder con un código de estado `200 OK`.
- **Y** la respuesta debe contener una estructura JSON válida que incluya:
  - KPIs financieros principales (`ingresos_totales`, `cantidad_pedidos`, `ticket_promedio`, `clientes_activos`).
  - Lista de productos más vendidos ordenada descendentemente por cantidad.
  - Lista de clientes más compradores ordenada descendentemente por monto gastado.
  - Distribución de estados de pedidos.
  - Evolución temporal diaria de ingresos y cantidad de pedidos.

### Escenario 2: Denegación de Acceso por Rol Insuficiente
- **Dado que** un usuario está autenticado en el sistema pero posee un rol que no es administrador (por ejemplo, `STOCK` o `CLIENT`).
- **Cuando** realiza una solicitud HTTP `GET /api/v1/admin/dashboard/metrics`.
- **Entonces** la API debe responder con un código de estado `403 Forbidden`.
- **Y** el cuerpo de la respuesta debe detallar que se requiere el rol `ADMIN` para acceder a este recurso.

### Escenario 3: Filtrado Temporal
- **Dado que** existen pedidos registrados en distintas fechas.
- **Cuando** el administrador realiza una solicitud `GET /api/v1/admin/dashboard/metrics` pasando los parámetros query `fecha_inicio` y `fecha_fin`.
- **Entonces** la API debe responder con `200 OK`.
- **Y** todas las métricas devueltas (KPIs, productos más vendidos, etc.) deben calcularse considerando exclusivamente las transacciones y pedidos creados dentro de ese rango de fechas.

### Escenario 4: Integridad de Datos (Exclusión de Pedidos Eliminados y Cancelados)
- **Dado que** existen pedidos marcados como eliminados (`deleted_at is not null`) o cancelados (`estado_codigo = "CANCELADO"`).
- **Cuando** se calculan los ingresos del dashboard.
- **Entonces** la API no debe incluir pedidos soft-deleted en ninguna de sus métricas.
- **Y** los pedidos cancelados deben ser excluidos del monto total de `ingresos_totales` y `ticket_promedio`, garantizando que la información financiera sea precisa y realista.
