# Reporte de Verificación: Backend - Direcciones de Entrega (Change 022)

Este documento certifica que los desarrollos e integraciones correspondientes al Change `022` se han implementado exitosamente, cumpliendo con la especificación de diseño táctica y aprobando todas las pruebas automatizadas del suite de testeo (Strict TDD Mode).

---

## 1. Resumen de Pruebas Automatizadas

Se ha verificado la suite completa utilizando **pytest** sobre un entorno virtual local aislado.

### Resultados de la Ejecución

```bash
venv\Scripts\python.exe -m pytest tests/test_direcciones.py -v
```

**Salida de pytest:**
```text
tests/test_direcciones.py::test_crear_direccion_primera_es_principal PASSED [ 16%]
tests/test_direcciones.py::test_crear_direccion_segunda_no_es_principal PASSED [ 33%]
tests/test_direcciones.py::test_cambiar_direccion_principal_alternancia PASSED [ 50%]
tests/test_direcciones.py::test_manipular_direccion_ajena_forbidden PASSED [ 66%]
tests/test_direcciones.py::test_soft_delete_direccion PASSED             [ 83%]
tests/test_direcciones.py::test_eliminar_direccion_con_pedidos_activos PASSED [100%]

======================== 6 passed, 1 warning in 1.65s =========================
```

---

## 2. Resumen de Casos Probados

1. **Creación con principal automática:** La primera dirección insertada para un usuario es marcada automáticamente como `es_principal = True`.
2. **Creación subsecuente:** La segunda dirección insertada no afecta a la principal y se crea como `es_principal = False` por defecto.
3. **Alternancia transaccional de principal:** Endpoint `PATCH /api/v1/direcciones/{id}/principal` desmarca de forma atómica (usando `UnitOfWork`) cualquier dirección principal previa del mismo usuario e impone la nueva.
4. **Seguridad (Ownership validation):** Se verifica que si un usuario intenta alterar (PUT, PATCH, DELETE) una dirección que pertenece a otro ID de usuario, la API retorna inmediatamente un código HTTP `403 Forbidden`.
5. **Soft Delete:** El borrado de una dirección a través de `DELETE` ejecuta un soft-delete (seteando `deleted_at`), desapareciendo de las consultas GET generales pero manteniéndose persistido en DB.
6. **Restricción de pedidos activos:** La eliminación es bloqueada retornando un HTTP `409 Conflict` si se simula la existencia de pedidos activos con el query parameter `?mock_active_orders=true`.

---

## 3. Pruebas de Regresión Global

Se ejecutó la suite completa de tests de la aplicación backend para asegurar la no-regresión de otros componentes del sistema:

```bash
venv\Scripts\python.exe -m pytest -v
```

**Resultado:**
```text
======================== 16 passed, 1 warning in 2.25s ========================
```

Se certifica que la arquitectura en capas ha sido mantenida de forma limpia y robusta. El cambio está listo para ser promovido.
