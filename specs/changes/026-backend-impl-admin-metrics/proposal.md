# Propuesta de Cambio: Dashboard de Métricas Administrativas
**ID del Cambio:** 026-backend-impl-admin-metrics
**Contexto:** Dashboard de Métricas Administrativas (Backend)

---

## 1. Objetivo General
Proveer un endpoint centralizado e integral en el backend (`GET /api/v1/admin/dashboard/metrics`) que proporcione métricas financieras, comerciales y de comportamiento de clientes. Este endpoint permitirá al administrador de "The Food Store" visualizar información crítica en tiempo real mediante KPIs y gráficos (tortas, barras, líneas, tablas) para facilitar la toma de decisiones.

## 2. Casos de Uso
1. **Visualización de KPIs Generales:** El administrador puede ver de un vistazo rápido los ingresos totales, el volumen total de pedidos, el ticket promedio y la cantidad de clientes activos.
2. **Evolución Temporal de Ventas:** Visualizar un gráfico de líneas con la evolución diaria de ingresos y volumen de pedidos.
3. **Ranking de Productos Populares:** Visualizar un gráfico de barras con el top 5 o 10 de productos más vendidos en el sistema.
4. **Clientes Destacados:** Visualizar una tabla con los usuarios que más pedidos y gastos han acumulado en la plataforma.
5. **Distribución por Estado:** Visualizar un gráfico de torta con la proporción de pedidos según su estado actual (PENDIENTE, ENTREGADO, CANCELADO, etc.).

## 3. Requisitos de Negocio y Reglas
- **Control de Acceso RBAC:** Solo los usuarios con rol `ADMIN` pueden consultar este endpoint. Cualquier otro rol (como `STOCK` o `CLIENT`) recibirá un código de estado `403 Forbidden`.
- **Filtros de Rango de Fechas (Opcionales):**
  - Parámetros query: `fecha_inicio` y `fecha_fin` (en formato ISO `YYYY-MM-DD`).
  - Si no se especifican, por defecto se calcularán las métricas de los **últimos 30 días** para evitar sobrecarga de consultas y mantener un rendimiento óptimo.
- **Exclusión de Datos Eliminados:** Los pedidos y usuarios marcados con eliminación lógica (`deleted_at is not null`) deben excluirse de todos los cálculos.
- **Filtro de Estados de Pedidos en Ingresos:** Los ingresos totales y tickets promedio se deben calcular basándose en pedidos con estados válidos (excluyendo aquellos con código `CANCELADO` o similar si la lógica comercial lo requiere; para máxima robustez, consideraremos ingresos sobre pedidos confirmados/entregados, aunque daremos la flexibilidad de sumar todos los pedidos excepto los cancelados/rechazados).

## 4. Impacto en la Arquitectura
El cambio se implementará siguiendo la arquitectura en capas estricta del proyecto:
1. **Controlador/Ruta:** Se implementará el endpoint en `backend/app/modules/admin/router.py` protegido con `Depends(require_role("ADMIN"))`.
2. **Esquemas:** Se definirán los esquemas de Pydantic para el response del dashboard en `backend/app/modules/admin/schemas.py`.
3. **Servicio:** Se creará la lógica de cálculo y agregación en `backend/app/modules/admin/service.py`.
4. **Persistencia (Unit of Work y Repositorios):** Se utilizará el `PedidoUoW` o el `get_session` correspondiente para realizar consultas directas y optimizadas a la base de datos a través de SQLAlchemy, evitando el problema de consultas N+1 cargando eficientemente las relaciones (`detalles` y `usuario`).

---

¿Apruebas esta propuesta para comenzar con el diseño técnico y el desglose de tareas?
