# Tareas de Implementación: Checkout y Confirmación en el Frontend (031-frontend-store-checkout)

Este documento detalla el checklist de desarrollo técnico para llevar adelante el cambio 031 en The Food Store.

---

## 1. Configuración de Modelos y Tipos
- [ ] Crear `frontend/src/features/checkout/types/checkout.types.ts` con todos los tipos de datos mapeados del backend.

## 2. Implementación de Servicios API
- [ ] Desarrollar `frontend/src/features/checkout/services/checkoutService.ts` integrando fetch con autenticación.
  - [ ] `listarDirecciones()`
  - [ ] `crearDireccion(data)`
  - [ ] `listarFormasPago()`
  - [ ] `crearPedido(data)`

## 3. Guardia de Autenticación
- [ ] Crear `frontend/src/router/AuthProtectedRoute.tsx` que requiera `isAuthenticated()` pero admita clientes y roles administrativos de igual forma.

## 4. Componentes Visuales del Checkout (`/checkout`)
- [ ] **Resumen del Pedido (`CheckoutSummary.tsx`):**
  - [ ] Mostrar lista de ítems del carrito con imágenes, cantidades y exclusiones.
  - [ ] Mostrar desglose de subtotales, costo de envío e importe total.
- [ ] **Dirección de Entrega (`AddressSelector.tsx`):**
  - [ ] Cargar direcciones mediante `listarDirecciones()`.
  - [ ] Mostrar tarjetas seleccionables premium.
  - [ ] Añadir botón "Agregar dirección".
- [ ] **Modal de Nueva Dirección (`NewAddressModal.tsx`):**
  - [ ] Formulario premium con validación para Calle, Altura, Ciudad y Alias.
  - [ ] Integrar con `crearDireccion()`. Refrescar la lista de direcciones del selector al guardar y preseleccionarla.
- [ ] **Métodos de Pago (`PaymentSelector.tsx`):**
  - [ ] Cargar formas de pago desde `listarFormasPago()`.
  - [ ] Mostrar tarjetas seleccionables dinámicas con iconos representativos (MercadoPago, Efectivo, Tarjeta).
- [ ] **Notas y Comentarios:**
  - [ ] Añadir campo de entrada de texto premium para anotaciones especiales.

## 5. Integración de Vistas y Rutas
- [ ] Crear la página principal `frontend/src/pages/checkout/CheckoutPage.tsx` organizando las columnas y controlando los estados de carga y validación.
  - [ ] Si el carrito está vacío, renderizar vista de "Carrito Vacío" con enlace al menú.
  - [ ] Controlar el flujo de submit para serializar exclusiones y llamar a `crearPedido()`.
  - [ ] Vaciar carrito (`clearCart()`) y redirigir tras éxito.
- [ ] Crear la página de éxito `frontend/src/pages/checkout/OrderSuccessPage.tsx` mostrando confeti, detalles del pedido y opciones de redirección.
- [ ] Enlazar el botón "Iniciar Checkout" de `CartDrawer` para dirigir a `/checkout`.
- [ ] Configurar las rutas en `frontend/src/router/AppRouter.tsx` protegiéndolas con `AuthProtectedRoute` y asociándolas a `PublicLayout`.

## 6. Verificación Estática y Pruebas
- [ ] Correr `npx tsc --noEmit` en el directorio `frontend/` para asegurar que el tipado de TypeScript compile sin errores.
- [ ] Verificar la visualización responsive y el estilo glassmorphic de alta gama.
