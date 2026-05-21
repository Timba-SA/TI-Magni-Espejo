# Change Proposal: Checkout y Confirmación en el Frontend (031-frontend-store-checkout)

## 1. Motivación y Objetivos
Actualmente, el frontend de **The Food Store** cuenta con una landing page premium, un catálogo de productos interactivo y un carrito de compras global (`CartDrawer`) con soporte para exclusión de ingredientes. Sin embargo, no hay forma de concretar la compra desde la interfaz web. El backend ya tiene implementados los módulos robustos de direcciones (`/direcciones`), pedidos (`/pedidos`) con su respectiva máquina de estados (FSM) y pagos con MercadoPago (`/pagos`).

El objetivo de este cambio es implementar la página premium de **Checkout y Confirmación en el Frontend**, integrándola directamente con la API real del backend.

### Metas Clave:
- Nueva página glassmorphic y premium de Checkout (`/checkout`) dentro de `PublicLayout`.
- Guardia de autenticación inteligente (`AuthProtectedRoute`) que permita el acceso de clientes logueados (rol `CLIENT`) y redirija a `/login` a los no autenticados, sin expulsarlos a la landing principal.
- Integración completa con la API de direcciones (`/direcciones`), listando las direcciones del usuario y permitiendo crear una nueva dirección desde el checkout.
- Integración completa con la API de formas de pago (`/pedidos/formas-pago`) para seleccionar métodos de pago activos en tiempo real (ej. MercadoPago, Efectivo).
- Creación de pedidos enviando el payload serializado correctamente al backend (`POST /pedidos`).
- Redirección tras compra exitosa a una página de éxito premium (`/checkout/success`) con detalles dinámicos del pedido.
- Cero mocks, integración real y tipado estricto con TypeScript.

---

## 2. Alcance
- **Página de Checkout (`/checkout`):**
  - Formulario/Secciones en columnas:
    - **Dirección de Entrega:** Mostrar direcciones existentes con selector. Botón interactivo para añadir una nueva dirección mediante modal/formulario inline.
    - **Forma de Pago:** Mostrar opciones habilitadas recuperadas del backend.
    - **Notas del Pedido:** Campo de texto opcional para indicaciones del envío (ej: "Sin cubiertos", "Tocar timbre B").
    - **Resumen del Pedido:** Listado colapsable de los ítems con subtotales, costo de envío, descuento y total general.
    - **Acción Principal:** Botón de "Confirmar y Pagar" / "Realizar Pedido" con micro-animación de carga.
- **Guard de Ruta (`AuthProtectedRoute`):**
  - Proteger `/checkout` y `/checkout/success`. A diferencia de `ProtectedRoute` (que bloquea a `CLIENT`), esta guardia simplemente requiere `isAuthenticated()`.
- **Página de Éxito (`/checkout/success`):**
  - Mensaje interactivo y premium de éxito.
  - Resumen detallado del pedido recién creado.
  - Enlaces para volver a la tienda o ir al panel si aplica (o a mis pedidos en el futuro).
- **Conectores y Tipos:**
  - Definir tipos de TypeScript en `src/features/checkout/types/checkout.types.ts` correspondientes a la API del backend.
  - Desarrollar el servicio en `src/features/checkout/services/checkoutService.ts`.

---

## 3. Alternativas y Tradeoffs
- **Alternativa A (Formulario multipaso en modal):**
  Hacer el checkout dentro de un modal en varias fases.
  *Tradeoff:* Más complejo de manejar en cuanto a estado, no tiene URL compartible y reduce la sensación de flujo de compra serio de un e-commerce premium.
- **Alternativa B (Página de Checkout dedicada en PublicLayout - RECOMENDADA):**
  Página completa con columnas responsivas (Resumen a la derecha en desktop, datos a la izquierda) y transiciones fluidas con Framer Motion.
  *Tradeoff:* Requiere configurar nuevas rutas públicas pero ofrece una experiencia de usuario extremadamente premium, limpia y espaciosa.

---

## 4. Impacto en la Arquitectura
- **Rutas:** `/checkout` y `/checkout/success` se agregan en `AppRouter.tsx`.
- **Estado Global:** Consumo de `CartContext` para leer ítems y vaciar el carrito al finalizar con éxito mediante `clearCart()`.
- **Servicios:** Creación del servicio para el checkout y direcciones.

---

## 5. Criterios de Aceptación Iniciales
- El usuario no logueado es redirigido a `/login` al entrar a `/checkout`, y tras loguearse regresa allí o a la tienda.
- El usuario puede elegir entre sus direcciones registradas o agregar una nueva de forma transparente.
- Las opciones de pago se consumen dinámicamente del backend.
- El payload enviado al backend cumple exactamente con `CrearPedidoRequest` (con exclusión de ingredientes serializada con comas en `personalizacion`).
- Tras una compra exitosa, el carrito se vacía y se muestra la pantalla de confirmación.
