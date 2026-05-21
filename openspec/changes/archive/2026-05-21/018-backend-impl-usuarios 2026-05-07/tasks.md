# Tasks: Change 018 — Backend: Gestión de Usuarios

## Backend

### Fase 1 — Modelo
- [x] 1.1 Agregar campo `is_active: bool = Field(default=True)` al modelo `Usuario` en `models.py`
- [x] 1.2 Ejecutar migración / recrear tablas con `is_active` (verificar seed post-migración)

### Fase 2 — Schemas
- [x] 2.1 Implementar `UsuarioResponse` (sin password_hash, sin deleted_at)
- [x] 2.2 Implementar `UsuarioDetailResponse(UsuarioResponse)` con `roles: list[str]`
- [x] 2.3 Implementar `UsuarioUpdateRequest` (nombre?, apellido?, celular?)

### Fase 3 — Repository
- [x] 3.1 Implementar `UsuarioRepository(BaseRepository[Usuario])`
- [x] 3.2 Agregar método `get_by_email(email: str) -> Usuario | None`
- [x] 3.3 Agregar método `get_all_active() -> list[Usuario]` (filtra deleted_at IS NULL)

### Fase 4 — UnitOfWork
- [x] 4.1 Implementar `UsuarioUoW(UnitOfWork)` con propiedad `usuarios: UsuarioRepository`

### Fase 5 — Service
- [x] 5.1 Implementar `get_me(usuario_id: int) -> UsuarioDetailResponse`
- [x] 5.2 Implementar `update_me(usuario_id: int, data: UsuarioUpdateRequest) -> UsuarioResponse`
- [x] 5.3 Implementar `get_all() -> list[UsuarioResponse]` (solo admin)
- [x] 5.4 Implementar `toggle_active(id: int, current_user_id: int) -> UsuarioResponse`

### Fase 6 — Router
- [x] 6.1 Verificar que `require_admin` exista en `auth/dependencies.py`
- [x] 6.2 Implementar `GET /me`
- [x] 6.3 Implementar `PATCH /me`
- [x] 6.4 Implementar `GET /` (admin)
- [x] 6.5 Implementar `PATCH /{id}/toggle-active` (admin)
- [x] 6.6 Registrar el router en `main.py` si no está registrado

## Frontend

### Fase 7 — Service y tipos
- [x] 7.1 Crear `src/features/usuarios/types/usuario.types.ts`
- [x] 7.2 Crear `src/features/usuarios/services/usuariosService.ts`

### Fase 8 — Página de usuarios
- [x] 8.1 Crear `src/pages/usuarios/UsuariosPage.tsx` con tabla y toggle activo/suspendido
- [x] 8.2 Registrar la ruta `/usuarios` en el router del panel admin
- [x] 8.3 Agregar el ítem en `AdminSidebar.tsx`
