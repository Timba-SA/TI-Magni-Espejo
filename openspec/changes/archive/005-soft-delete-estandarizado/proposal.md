# Change 005 — Soft Delete Estandarizado

**Estado:** Pendiente de aprobación  
**Módulos afectados:** categorias, productos, usuarios  
**Tipo:** Refactoring + Feature

## Problema

El sistema actual tiene soft delete implementado de forma **inconsistente**:

- Los modelos ya tienen el campo `deleted_at` ✅  
- El `BaseRepository` ya tiene `soft_delete()` ✅  
- Los servicios **ignoran** `soft_delete()` y hacen la asignación manual ⚠️  
- Los schemas de respuesta **no exponen** `deleted_at` ni `is_active` en todos los módulos ❌  
- No existe un endpoint de "restaurar" ni de "listar archivados" en ningún módulo ❌  
- El módulo de Usuarios carece de endpoint `DELETE /{id}` para soft delete ❌  
- La semántica `is_active` vs `deleted_at` no está documentada ni separada en los schemas ❌

## Propuesta

Estandarizar el ciclo de vida de los recursos en los tres módulos siguiendo estas reglas:

| Estado         | Campo          | Visible en admin | Elimina físico |
|----------------|----------------|-----------------|----------------|
| Activo         | ambos nulos    | ✅ Sí           | No             |
| Pausado        | `is_active=False` | ✅ Sí (con etiqueta "Inactivo") | No |
| Archivado      | `deleted_at != None` | ❌ No (solo con `?include_deleted=true`) | No |

> **Nota:** `is_active` solo aplica a Productos y Usuarios. Categorías no tienen este campo.
