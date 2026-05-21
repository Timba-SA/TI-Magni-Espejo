# Índice Activo de Cambios (SDD)

Este documento mantiene el registro de todos los cambios gestionados bajo la metodología Spec-Driven Development (SDD) en The Food Store.

### Estados permitidos:
- **Draft:** Propuesta en redacción.
- **Approved:** Propuesta aprobada, lista para implementación.
- **In Progress:** Implementación en curso.
- **Done:** Implementado y verificado.
- **Rejected:** Propuesta rechazada.

## Registro de Cambios Activos (Backend Implementation)

| Change ID | Estado | Contexto | Artefactos |
|---|---|---|---|
| 015-frontend-store-checkout | Draft | Flujo de checkout de la tienda en el Frontend | proposal, design, tasks, acceptance |
| 022-backend-impl-direcciones | Draft | Implementación de Direcciones de Entrega | proposal, design, tasks, acceptance |
| 023-backend-impl-pedidos | Draft | Implementación de Pedidos y Máquina de Estados (FSM) | proposal, design, tasks, acceptance |
| 024-backend-impl-pagos | Draft | Integración con MercadoPago (Idempotency y Webhook) | proposal, design, tasks, acceptance |
| 025-backend-impl-admin-stock | Draft | Gestión de Stock y Disponibilidad (Admin) | proposal, design, tasks, acceptance |
| 026-backend-impl-admin-metrics | Draft | Dashboard de Métricas Administrativas | proposal, design, tasks, acceptance |
| 027-frontend-navbar-ui-and-dark-mode | Done | Navbar UI Refinements + Dark/Light Mode en Login y Panel | proposal, design, tasks, acceptance, verification |

## Registro de Cambios Archivados (Frontend y Baseline)

Estos changes fueron completados y archivados en `openspec/changes/archive/`.

| Change ID | Estado | Contexto |
|---|---|---|
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
