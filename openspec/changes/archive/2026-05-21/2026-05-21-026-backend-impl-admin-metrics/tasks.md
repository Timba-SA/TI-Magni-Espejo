# Plan de Implementación (Tasks)
**ID del Cambio:** 026-backend-impl-admin-metrics
**Contexto:** Dashboard de Métricas Administrativas (Backend)

---

## Plan de Trabajo (Checklist)

### 1. Esquemas de Pydantic
- [x] Definir los esquemas de respuesta en `backend/app/modules/admin/schemas.py`:
  - [x] `MetricKPICards`
  - [x] `ProductoVendidoResponse`
  - [x] `ClienteMasCompradorResponse`
  - [x] `DistribucionPedidosResponse`
  - [x] `VentaTemporalResponse`
  - [x] `DashboardMetricsResponse`

### 2. Capa de Servicios
- [x] Implementar el método `obtener_metricas_dashboard` en `AdminService` dentro de `backend/app/modules/admin/service.py`.
- [x] Implementar consultas optimizadas de agregación utilizando SQLAlchemy/SQLModel:
  - [x] Filtro temporal dinámico con fallback a 30 días si no se proveen parámetros.
  - [x] Exclusión de eliminaciones lógicas (`deleted_at is not null`).
  - [x] Agregación para KPIs (ingresos, ticket promedio, clientes activos, volumen de pedidos).
  - [x] Consulta de Top 5 productos más vendidos.
  - [x] Consulta de Top 5 clientes más compradores.
  - [x] Distribución de pedidos por estado.
  - [x] Agrupación diaria de ingresos y volumen para la evolución temporal.

### 3. Capa de Rutas y Controladores
- [x] Registrar y configurar el endpoint `GET /admin/dashboard/metrics` en `backend/app/modules/admin/router.py`.
- [x] Proteger el router con el middleware de seguridad RBAC `Depends(require_role("ADMIN"))`.
- [x] Registrar el router de admin en la inicialización de FastAPI en `backend/app/main.py` si no está registrado o configurado bajo el prefijo correcto.

### 4. Verificación y Calidad (Strict TDD Mode)
- [x] Crear el archivo de pruebas `backend/tests/test_admin_metrics.py`.
  - [x] **Test 1:** Validar que un administrador (`ADMIN`) puede consultar las métricas con éxito y recibir el payload estructurado.
  - [x] **Test 2:** Validar que un operador con rol `STOCK` o un cliente con rol `CLIENT` reciban un `403 Forbidden` al invocar el endpoint de métricas.
  - [x] **Test 3:** Validar que el filtrado temporal por rango de fechas (`fecha_inicio` y `fecha_fin`) funcione correctamente restringiendo las métricas a dicho período.
  - [x] **Test 4:** Validar que los pedidos con eliminación lógica (`deleted_at` cargado) o estado `CANCELADO` (para el cálculo de ingresos) se excluyan o procesen según las reglas de negocio.
- [x] Ejecutar pytest para verificar que la suite completa pase al 100% en verde.
