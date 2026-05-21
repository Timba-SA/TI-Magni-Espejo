# Lista de Tareas: Mejoras en la Gestión de Usuarios

**ID del Cambio:** `033-mejoras-gestion-usuarios`  

---

## 1. Fase de Preparación y Testing (Strict TDD Mode) 🧪
- [x] Crear el archivo de pruebas en el backend `backend/tests/test_usuarios.py` que valide:
  - Crear un nuevo usuario por parte de un ADMIN.
  - Filtrar la lista de usuarios por rol (`ADMIN`, `ENCARGADO`).
  - Obtener usuarios incluyendo los eliminados y filtrando eliminados.
  - Intentar auto-eliminarse y recibir un error HTTP 400.
  - Realizar soft delete de otro usuario de forma exitosa.
  - Restaurar un usuario previamente eliminado y verificar que vuelva a estar activo.

---

## 2. Fase Backend (FastAPI + SQLModel) 🐍

### 2.1. Esquemas (`backend/app/modules/usuarios/schemas.py`)
- [x] Definir `UsuarioCreateRequest` con validaciones básicas de Pydantic.

### 2.2. Repositorio (`backend/app/modules/usuarios/repository.py`)
- [x] Modificar `get_all_active_paginated` para recibir el argumento opcional `rol` y aplicar el JOIN/filtro correspondiente en la query SQLModel.

### 2.3. Servicio (`backend/app/modules/usuarios/service.py`)
- [x] Modificar `get_all` para reenviar el parámetro `rol` al repositorio.
- [x] Implementar el método `crear_administrativo(self, data: UsuarioCreateRequest, current_user_id: int)` asegurando el hashing de clave y la asignación de roles mediante la tabla asociativa.
- [x] Implementar el método `restaurar(self, usuario_id: int, current_user_id: int)` que limpie el campo `deleted_at` y active al usuario.

### 2.4. Router (`backend/app/modules/usuarios/router.py`)
- [x] Actualizar el query parameter `rol` en el endpoint `GET /`.
- [x] Agregar el endpoint `POST /` (crear usuario administrativo) restringido a rol `ADMIN`.
- [x] Agregar el endpoint `PATCH /{id}/restore` restringido a rol `ADMIN`.

---

## 3. Fase Frontend (React + TypeScript) ⚛️

### 3.1. Tipos (`frontend/src/features/users/types/user.types.ts`)
- [x] Agregar la interfaz `UsuarioCreateRequest`.
- [x] Asegurarse de que `UsuarioResponse` y `UsuarioDetailResponse` soporten correctamente `deleted_at: string | null`.

### 3.2. Servicio API (`frontend/src/features/users/services/usersService.ts`)
- [x] Actualizar `getUsuarios` para enviar `includeDeleted` y `rol` opcionales en la query string.
- [x] Crear la función `crearUsuario` (`POST /usuarios/`).
- [x] Crear la función `eliminarUsuario` (`DELETE /usuarios/${id}`).
- [x] Crear la función `restaurarUsuario` (`PATCH /usuarios/${id}/restore`).

### 3.3. Componente Modal (`frontend/src/pages/usuarios/components/UsuarioCreateModal.tsx`)
- [x] Crear el modal premium con glassmorphism, validación del formulario de alta y selectors dinámicos de roles.

### 3.4. Vista Principal (`frontend/src/pages/usuarios/UsuariosPage.tsx`)
- [x] Agregar filtros: Dropdown de roles, Toggle Switch de "Ver Archivados".
- [x] Incorporar el botón "+ Nuevo Usuario" para gatillar el modal de creación.
- [x] Integrar botón e icono de Soft Delete (`Trash2`) para eliminar usuarios con modal/alerta de confirmación.
- [x] Integrar botón e icono de Restauración (`RotateCcw`) para restaurar a los usuarios que estén bajo soft-delete.
- [x] Ajustar la visualización: si un usuario está en soft-delete, bajar la opacidad de la fila y renderizar el badge de "Eliminado".
- [x] Asegurar compilación limpia del frontend con `tsc --noEmit`.

