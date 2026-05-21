# Proposal: Change 018 — Backend: Gestión de Usuarios

## Contexto

El módulo de usuarios ya tiene la estructura de carpetas y un `models.py` funcional con el modelo `Usuario`. Sin embargo, los archivos `schemas.py`, `repository.py`, `service.py`, `unit_of_work.py` y `router.py` contienen solo comentarios `# TODO`.

Este change implementa la capa completa de gestión de usuarios, exponiendo endpoints para:
1. Que cualquier usuario autenticado consulte y edite su propio perfil (`/me`)
2. Que el admin liste todos los usuarios activos y pueda desactivarlos (soft-delete o toggle de `is_active`)

## Alcance

### Backend

- `schemas.py` → `UsuarioResponse`, `UsuarioDetailResponse`, `UsuarioUpdateRequest`
- `repository.py` → `UsuarioRepository` (get_by_email, get_all_active, soft_delete)
- `unit_of_work.py` → `UsuarioUoW`
- `service.py` → `UsuarioService` (get_me, update_me, get_all, toggle_active)
- `router.py` → 4 endpoints según el diseño

### Frontend

- `UsersPage.tsx` → tabla de usuarios (admin) con toggle activo/inactivo
- Conectar con los endpoints del backend

## Endpoints propuestos

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/usuarios/me` | Bearer | Perfil propio |
| `PATCH` | `/api/v1/usuarios/me` | Bearer | Editar perfil propio |
| `GET` | `/api/v1/usuarios/` | Admin | Listar todos los usuarios |
| `PATCH` | `/api/v1/usuarios/{id}/toggle-active` | Admin | Activar/desactivar usuario |

## Decisiones de diseño

- **No se expone `DELETE`**: el modelo tiene `deleted_at`, pero para el panel admin es más útil un toggle `is_active` que permite suspender/reactivar sin perder historial.
- El campo `is_active` debe agregarse al modelo `Usuario` (actualmente no existe — solo `deleted_at`).
- `password_hash` **nunca** se expone en ningún response schema.
- `email` no se puede cambiar desde el endpoint `/me` (requeriría flujo de verificación separado).
- El patrón de implementación sigue exactamente el módulo `categorias` (UoW → Repository → Service → Router).

## Fuera del alcance

- Cambio de email (requiere verificación por correo)
- Cambio de contraseña (requiere flujo de "forgot password")
- Gestión de roles desde el frontend (los roles se asignan en seeding)
