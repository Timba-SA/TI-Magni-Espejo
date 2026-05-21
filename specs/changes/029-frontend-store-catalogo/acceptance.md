# Criterios de Aceptación: Catálogo de Productos Premium (Frontend)
Change ID: `029-frontend-store-catalogo`

Los siguientes escenarios describen los comportamientos y especificaciones que la interfaz de usuario debe cumplir para dar por finalizada la implementación del catálogo dinámico.

---

### Escenario 1: Carga Inicial de Datos y Shimmer Effect
**Given** un cliente que accede a la página de la carta (`/menu` o `/carta`)
**When** el frontend realiza la llamada de red a los servicios `getActiveCategorias` y `getActiveProductos`
**Then** se debe mostrar una grilla de componentes `LoadingSkeleton` con animación de brillo activo
**And** una vez completada la llamada con éxito, los esqueletos deben desaparecer fluidamente, revelando las categorías y productos reales del backend.

---

### Escenario 2: Cambio Dinámico de Categorías y Filtro
**Given** el catálogo cargado con éxito en el frontend
**When** el cliente hace clic en una pestaña de categoría (ej: "Bebidas")
**Then** el degradado de fondo debe cambiar suavemente de tono HSL (rojo borgoña para bebidas, naranja magma para platos, dorado para postres)
**And** se deben filtrar en pantalla únicamente los productos asociados a la categoría seleccionada (usando `producto.categorias[x].categoria_id`)
**And** los elementos deben entrar con una animación por cascada sutil de abajo hacia arriba.

---

### Escenario 3: Modal de Detalle e Ingredientes Removibles
**Given** que el cliente visualiza la tarjeta de un producto con ingredientes configurados
**When** hace clic en la tarjeta del producto
**Then** se debe desplegar un modal o drawer premium con desenfoque de fondo (`backdrop-blur`) conteniendo la descripción, imagen ampliada, precio y la lista de ingredientes del producto
**And** por cada ingrediente que tenga `es_removible: true`, se debe renderizar un chip interactivo que el usuario puede desmarcar para excluirlo del plato
**And** si el ingrediente tiene `es_removible: false`, se debe mostrar como texto descriptivo o un chip bloqueado sin opción de desmarcarlo.

---

### Escenario 4: Control de Stock y Disponibilidad
**Given** que un producto tiene `disponible: false` o su `stock_cantidad` es menor o igual a cero en el backend
**When** el catálogo carga la lista de productos
**Then** dicho producto NO debe figurar en la lista pública de productos activos
**Or** en caso de que figure, debe mostrarse con una etiqueta visible de "Agotado", con el botón de "Agregar al Carrito" deshabilitado y opacidad atenuada.

---
¿Apruebas estos Criterios de Aceptación para redactar el checklist final de tareas?
