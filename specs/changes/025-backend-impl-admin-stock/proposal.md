# Propuesta de Cambio (Proposal)
**ID del Cambio:** 025-backend-impl-admin-stock
**Contexto:** Gestión de Stock y Disponibilidad de Productos (Backend)

---

## 1. Problema de Negocio
Actualmente, el sistema de pedidos de *The Food Store* reduce automáticamente las existencias de los productos al procesar las compras. Sin embargo, no existe un flujo de backend dedicado y seguro que le permita al administrador o al operador de inventario (rol `STOCK`):
1. Cargar stock de manera manual cuando llega mercadería o insumos.
2. Desactivar temporalmente la venta de un plato (por ejemplo, si el chef reporta que se acabaron los insumos clave en medio de un turno) independientemente de que quede stock.

Como se especifica en el diagrama de clases SVG, los campos `stock_cantidad` y `disponible` son flags independientes:
* Un producto puede tener stock `0` pero seguir `disponible=True` (mostrándose como "Sin Stock" en la interfaz).
* Un producto puede tener stock `> 0` pero estar `disponible=False` (pausado explícitamente por el operador, oculto de la venta).

---

## 2. Solución Propuesta
Implementar un endpoint REST específico y protegido por control de acceso RBAC que permita actualizar de forma transaccional el stock y la disponibilidad del producto.

### Flujo de Autorización (RBAC)
Según la matriz de seguridad del SVG de clases, existen roles específicos de negocio:
* `ADMIN`: Acceso total.
* `STOCK`: Rol asignado a personal de inventario/cocina con permisos exclusivos para actualizar stock y disponible.

El endpoint requerirá que el llamador cuente con al menos uno de estos dos roles (`ADMIN` o `STOCK`).

---

## 3. Impacto y Alcance
* **Módulo Afectado:** `backend/app/modules/productos` (Modelos, Esquemas, Servicios y Rutas).
* **Base de Datos:** Se reutilizan las columnas de base de datos existentes en el modelo `Producto`: `stock_cantidad` (INTEGER) y `disponible` (BOOLEAN). No requiere migraciones ni alteraciones del esquema físico de tablas.
* **Seguridad:** Uso de la dependencia `require_role("ADMIN", "STOCK")` provista en `backend/app/core/dependencies.py`.
