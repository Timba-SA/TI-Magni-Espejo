# Índice Activo de Cambios (SDD)

Este documento mantiene el registro de todos los cambios gestionados bajo la metodología Spec-Driven Development (SDD) en The Food Store.

### Estados permitidos:
- **Draft:** Propuesta en redacción.
- **Approved:** Propuesta aprobada, lista para implementación.
- **In Progress:** Implementación en curso.
- **Done:** Implementado y verificado.
- **Rejected:** Propuesta rechazada.

## Registro de Cambios Activos (Backend & Frontend Implementation)

| Change ID | Estado | Contexto | Artefactos |
|---|---|---|---|
| 031-frontend-store-checkout | Draft | Flujo de Checkout y Confirmación en el Frontend | proposal, design, tasks, acceptance |

## Registro de Cambios Archivados (Frontend y Baseline)

Estos changes fueron completados y archivados en `openspec/changes/archive/`.

| Change ID | Estado | Contexto |
|---|---|---|
| 030-frontend-store-carrito | Done | Sistema de Carrito de Compras en el Frontend |
| 029-frontend-store-catalogo | Done | Catálogo de Productos Premium en el Frontend |
| 025-backend-impl-admin-stock | Done | Gestión de Stock y Disponibilidad (Admin) |
| 026-backend-impl-admin-metrics | Done | Dashboard de Métricas Administrativas |
| 027-frontend-navbar-ui-and-dark-mode | Done | Navbar UI Refinements + Dark/Light Mode en Login y Panel |
| 023-backend-impl-pedidos | Done | Implementación de Pedidos y Máquina de Estados (FSM) |
| 024-backend-impl-pagos | Done | Integración con MercadoPago (Idempotency y Webhook) |
| 022-backend-impl-direcciones | Done | Implementación de Direcciones de Entrega |
| 021-backend-impl-productos | Done | Implementación de Productos y Catálogo |
| 028-backend-impl-user-roles | Done | Edición de Roles de Usuario (Backend y Frontend UI) |
| 000-project-baseline | Done | Documentación del estado actual del proyecto The Food Store |
| 002-frontend-landing-premium | Done | Desarrollo de la UI pública premium con Tailwind y React Router |
| 006-frontend-folder-restructure | Done | Mover todos los archivos y carpetas del frontend a una nueva carpeta `frontend` |
| 007-premium-ui-reservas-contacto | Done | Rediseño premium de páginas Reservas y Contacto |
| 009-premium-ui-insumos-form | Done | Rediseño premium del formulario de Nuevo/Editar Insumo |
| 012-visual-break-redesign | Done | Rediseño de la sección VisualBreak en la landing |
| 016-backend-impl-seed-data | Done | Seed Data: Roles, EstadoPedido, FormaPago y Admin inicial |
| 017-backend-impl-auth | Done | Autenticación JWT + RBAC: login, refresh, logout, rate limiting |
| 018-backend-impl-usuarios | Done | Implementación de Usuarios, Suspender Cuentas, y Panel de Administración |
| 020-backend-impl-ingredientes | Done | CRUD Ingredientes: paginación, filtros, soft delete, exportación .xlsx |
| 021-pagination-and-export | Done | Paginación por servidor y Exportación a Excel en Categorías, Usuarios e Insumos |
