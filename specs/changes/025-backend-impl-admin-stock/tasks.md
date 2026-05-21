# Plan de Implementación (Tasks)
**ID del Cambio:** 025-backend-impl-admin-stock
**Contexto:** Gestión de Stock y Disponibilidad de Productos (Backend)

---

## Plan de Trabajo (Checklist)

### 1. Esquemas de Pydantic
- [x] Definir el esquema `ProductoDisponibilidadUpdate` en `backend/app/modules/productos/schemas.py` con validaciones de campos (por ejemplo, `ge=0` para el stock).

### 2. Capa de Servicios
- [x] Agregar el método `actualizar_disponibilidad` en `ProductoService` dentro de `backend/app/modules/productos/service.py`.
- [x] Implementar el control de transacciones a través de `ProductoUoW`, validar que el producto exista y esté activo (no borrado lógicamente), y actualizar las propiedades correspondientes.

### 3. Capa de Rutas y Controladores
- [x] Crear el endpoint `PATCH /productos/{id}/disponibilidad` en `backend/app/modules/productos/router.py`.
- [x] Aplicar la protección RBAC adecuada inyectando la dependencia `Depends(require_role("ADMIN", "STOCK"))`.

### 4. Verificación y Calidad (Strict TDD Mode)
- [x] Implementar pruebas automatizadas unitarias e integrales en `backend/tests/test_productos_stock.py`.
  - [x] **Test 1:** Validar que un administrador (`ADMIN`) o encargado (`STOCK`) puede actualizar el stock y la disponibilidad con éxito.
  - [x] **Test 2:** Validar que un cliente común (`CLIENT`) reciba `403 Forbidden` al intentar invocar este endpoint.
  - [x] **Test 3:** Validar que un valor de stock negativo (`< 0`) devuelva `422 Unprocessable Entity` (validación de Pydantic).
  - [x] **Test 4:** Validar que la actualización de un producto inexistente devuelva `404 Not Found`.
- [x] Ejecutar pytest para comprobar que toda la suite de pruebas del backend (incluidos los nuevos tests) pase en verde sin warnings de regresión.
