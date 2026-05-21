# Checklist de Implementación: Backend - Direcciones de Entrega

Este archivo detalla el plan de acción táctico paso a paso para completar el requerimiento de gestión de direcciones de envío en el backend de The Food Store.

---

## Fase 1: Pruebas Automatizadas (Strict TDD Mode)
- [x] Crear archivo de pruebas `backend/tests/test_direcciones.py`.
- [x] Implementar test: Creación de dirección asignando automáticamente principal en la primera dirección.
- [x] Implementar test: Creación de segunda dirección (debe ser `es_principal = False` por defecto).
- [x] Implementar test: Alternancia transaccional de principal mediante endpoint `PATCH /{id}/principal`.
- [x] Implementar test: Denegación de manipulación de direcciones ajenas (`403 Forbidden`).
- [x] Implementar test: Soft delete satisfactorio (se oculta en GET principal).
- [x] Implementar test: Restricción de eliminación si existen pedidos activos (`409 Conflict`) [diseñar test con placeholder/mock controlable].

---

## Fase 2: Modelado e Infraestructura de DB
- [x] Implementar la clase `DireccionEntrega` en `backend/app/modules/direcciones/models.py`.
- [x] Registrar la relación inversa (si es útil) en el modelo `Usuario` en `backend/app/modules/usuarios/models.py`.
- [x] Crear e implementar `DireccionRepository` en `backend/app/modules/direcciones/repository.py` con las consultas personalizadas de SQLite/PostgreSQL (obtener activas, desmarcar principales previas).
- [x] Registrar `DireccionRepository` en la clase `DireccionUoW` en `backend/app/modules/direcciones/unit_of_work.py`.

---

## Fase 3: Capa de Negocio (Schemas, Services & Routers)
- [x] Diseñar esquemas de Pydantic (`DireccionCreateRequest`, `DireccionUpdateRequest`, `DireccionResponse`) en `backend/app/modules/direcciones/schemas.py`.
- [x] Implementar la lógica completa del negocio en `DireccionService` (`backend/app/modules/direcciones/service.py`):
  - Validaciones de propiedad y existencia.
  - Alternancia atómica de dirección principal.
  - Verificación de pedidos activos.
- [x] Implementar los endpoints HTTP en el `APIRouter` de `backend/app/modules/direcciones/router.py`.
- [x] Registrar el router de direcciones en `backend/main.py` mediante `app.include_router(direcciones_router, prefix="/api/v1")`.

---

## Fase 4: Verificación Final
- [x] Ejecutar todos los tests automatizados de la suite completa (`pytest`) y verificar su correcto paso en verde.
- [x] Registrar los cambios en `changes.md` y redactar `verification.md` para el Change `022`.
