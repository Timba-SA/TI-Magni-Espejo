# Propuesta de Cambio: Mejoras en la Gestión de Usuarios (ABM Módulo Admin)

**ID del Cambio:** `033-mejoras-gestion-usuarios`  
**Autor:** Antigravity  
**Estado:** Propuesta  
**Fecha:** 2026-05-21  

---

## 1. Contexto y Objetivos

Actualmente, el Panel de Administración cuenta con una vista de **Gestión de Usuarios** (`UsuariosPage.tsx`) que implementa la visualización y paginación básica, el toggle de estado (`is_active` para suspender) y la asignación binaria del rol `ADMIN`. 

Sin embargo, para cumplir rigurosamente con los estándares y los requerimientos del negocio, nos falta completar el **ABM / CRUD completo** de usuarios, permitiendo:
1. **Creación administrativa de usuarios:** Alta directa de cuentas con roles clave (como `ENCARGADO` o `ADMIN`) desde el panel, sin pasar por la registración pública de clientes.
2. **Filtro por rol:** Búsqueda y listado paginado filtrando por los roles del sistema (`ADMIN`, `ENCARGADO`, `CLIENTE`, etc.) tanto en backend como frontend.
3. **Soft Delete completo (Acción y Visualización):** Gatillar la eliminación lógica (`DELETE /usuarios/{id}`) desde el frontend, poder visualizar los usuarios archivados/eliminados con un switch premium e implementar la restauración de usuarios eliminados (`PATCH /usuarios/{id}/restore`).
4. **Asignación flexible de múltiples roles:** En lugar de un toggle binario ADMIN/CLIENTE, permitir asignar o remover roles de forma granular.

---

## 2. Alcance de los Cambios

### Backend (`app.modules.usuarios` y `app.modules.auth`)
- **Filtro por Rol en Listado:** Modificar `GET /usuarios/` y `UsuarioRepository.get_all_active_paginated` para recibir un query parameter `rol` opcional y aplicar un join con `UsuarioRol`.
- **Creación Administrativa:** Crear endpoint `POST /usuarios/` exclusivo para `ADMIN` que reciba `UsuarioCreateRequest` (con nombre, apellido, email, celular, password y lista de roles iniciales).
- **Restauración de Soft Delete:** Crear endpoint `PATCH /usuarios/{id}/restore` para poder recuperar a un usuario archivado limpiando su campo `deleted_at`.

### Frontend (`frontend/src/features/users`)
- **API Cliente:** Actualizar `usersService.ts` para soportar creación (`crearUsuario`), soft delete (`eliminarUsuario`), restauración (`restaurarUsuario`) y el envío de parámetros de filtrado (`rol`, `include_deleted`).
- **Vista de Usuarios (`UsuariosPage.tsx`):**
  - Botón **"+ Nuevo Usuario"** que abre un modal con formulario premium glassmorphism.
  - Dropdown premium para **Filtrar por Rol**.
  - Toggle switch premium para **"Ver Archivados / Eliminados"**.
  - Acción de **Soft Delete** con confirmación.
  - Acción de **Restaurar** para usuarios previamente eliminados.
  - Select granular de roles para soportar roles variados (ADMIN, ENCARGADO, CLIENTE).

---

## 3. Criterios de Aceptación

1. **Alta Correcta:** El Admin puede crear un usuario con el rol que desee y éste puede loguearse usando sus credenciales normales.
2. **Filtros Fluidos:** Cambiar el filtro de rol o el toggle de eliminados refresca la tabla usando paginación reactiva.
3. **Soft Delete & Restauración:** Eliminar un usuario lo oculta por defecto del listado ordinario, pero al activar "Ver Archivados" se muestra con etiqueta "Eliminado" y permite restaurarlo inmediatamente con un click.
4. **Seguridad Estricta:** Todos los endpoints de administración validan que el usuario solicitante posea el rol de `ADMIN`.

---

## 4. Alternativas y Tradeoffs

- **Alternativa A (Creación básica):** No pedir contraseña al crear al usuario y enviarle un mail para setearla.
  - *Tradeoff:* Requiere infraestructura de correos (SMTP, tokens de setup) que actualmente no está en el stack local del seed.
  - *Decisión:* El Admin define una contraseña inicial segura y el usuario la podrá cambiar después desde su perfil.
- **Alternativa B (Join pesado en BD):** Cargar todos los usuarios y filtrar en memoria en Python.
  - *Tradeoff:* Pésimo rendimiento para bases de datos medianas/grandes.
  - *Decisión:* Hacer un JOIN directo en SQLite contra `usuario_roles` para paginar correctamente desde la base de datos.
