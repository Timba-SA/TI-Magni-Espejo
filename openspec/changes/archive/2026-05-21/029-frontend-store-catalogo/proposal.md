# Propuesta de Cambio: Catálogo de Productos Premium (Frontend)
Change ID: `029-frontend-store-catalogo`

Esta propuesta describe el diseño y la implementación del Catálogo de Productos Premium en el frontend de **The Food Store**, transformando la actual carta estática en una experiencia de usuario (UX) sumamente fluida, viva y conectada en tiempo real con la API del backend.

## Motivación
Actualmente, la sección de la carta (`MenuPage` / `MenuExperience.tsx`) contiene una lista de platos y bebidas totalmente hardcodeada en el frontend. Si bien cuenta con una estética premium y micro-animaciones excepcionales en Framer Motion, no permite reflejar los cambios reales de stock, precios ni la adición/eliminación de productos del backend.
Este cambio reemplazará el contenido estático por datos dinámicos provenientes del servidor, manteniendo y elevando la calidad visual del diseño original (glassmorphism, dark mode, transiciones fluidas de color, filtros dinámicos y adaptabilidad móvil).

## Impacto y Alcance
* **Módulos Afectados:**
  * `frontend/src/features/catalogo/`: Creación de la feature para manejo del estado, servicios de llamada a la API y componentes del catálogo.
  * `frontend/src/pages/public/MenuPage.tsx`: Reemplazo del componente estático por el dinámico conectado.
  * `frontend/src/router/`: Registro/verificación de la ruta si es necesario.
* **Integración de Datos:**
  * Consumo de `GET /categorias/` para renderizar las pestañas de categorías dinámicamente.
  * Consumo de `GET /productos/` con soporte de filtros (disponibilidad y categoría).
  * Consumo de `GET /productos/{id}` para abrir un modal/drawer de detalle premium cuando se expande un plato, cargando sus ingredientes interactivos (y si son opcionales/removibles).

## Plan de Retorno (Rollback)
Si surgen fallas críticas de rendimiento o integración durante la implementación, podemos volver al estado anterior simplemente restaurando `MenuPage.tsx` para que apunte nuevamente al componente estático `MenuExperience.tsx`, garantizando que la producción nunca se caiga.
El desarrollo se hará sobre una rama limpia y aislada o bien integrado directamente en `master` con un toggle de feature flag si el usuario lo prefiere.

---
¿Apruebas esta propuesta inicial para continuar con el diseño detallado y los criterios de aceptación?
