# Criterios de Aceptación: Sistema de Carrito de Compras
Change ID: `030-frontend-store-carrito`

Los siguientes escenarios en formato Given/When/Then describen los comportamientos mínimos que debe validar la suite de pruebas e interacción manual.

---

### Escenario 1: Agrupación de Ítems sin Personalización
**Given** que el cliente se encuentra en la carta pública
**And** el carrito de compras está inicialmente vacío
**When** agrega "Coca-Cola" (sin ingredientes excluidos) al carrito
**And** luego agrega otra unidad de "Coca-Cola" (sin ingredientes excluidos)
**Then** el carrito debe contener únicamente **1 línea de ítem**
**And** su cantidad debe ser **2**
**And** el precio total del carrito debe reflejar la suma de ambas unidades.

---

### Escenario 2: Separación de Ítems con Personalizaciones Distintas
**Given** que el cliente visualiza un producto personalizable (ej. "Hamburguesa Premium")
**When** agrega una "Hamburguesa Premium" excluyendo el ingrediente "Cebolla"
**And** luego agrega otra "Hamburguesa Premium" excluyendo el ingrediente "Tomate"
**Then** el carrito debe contener **2 líneas de ítems distintas**
**And** cada ítem debe mostrar correctamente qué ingrediente fue excluido
**And** la cantidad de cada uno debe ser **1**.

---

### Escenario 3: Control y Validación de Stock en el Carrito
**Given** un producto que tiene un `stock_cantidad` igual a **3** en la base de datos
**When** el cliente agrega el producto al carrito e intenta incrementar la cantidad a **4** desde el CartDrawer
**Then** la cantidad en el carrito debe limitarse automáticamente a **3**
**And** el botón de incrementar (+) debe deshabilitarse visualmente
**And** se debe mostrar un aviso sutil de "Límite de stock disponible alcanzado" para evitar pedidos imposibles.

---

### Escenario 4: Reactividad de Navbar e Icono Contador
**Given** que el cliente agrega productos al carrito
**When** el estado global del carrito cambia
**Then** el icono flotante del carrito en la Navbar debe actualizar de forma inmediata su burbuja de notificación sumando la cantidad total de unidades (`totalItems`)
**And** al hacer clic en el icono se debe desplegar el `CartDrawer` lateral deslizable desde la derecha.

---

### Escenario 5: Persistencia tras Recarga de Navegador (Resiliencia)
**Given** un carrito con varios productos y personalizaciones cargadas
**When** el usuario realiza una recarga forzada de la página (F5 o refresh)
**Then** el estado global del carrito debe cargarse de manera transparente desde `localStorage`
**And** renderizar de inmediato la misma selección de productos sin hacer llamadas extras innecesarias al servidor.
