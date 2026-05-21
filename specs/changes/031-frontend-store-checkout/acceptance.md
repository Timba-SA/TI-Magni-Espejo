# Criterios de Aceptación: Checkout y Confirmación en el Frontend (031-frontend-store-checkout)

Este documento define las condiciones y escenarios necesarios para dar por completada la funcionalidad de Checkout y Confirmación en la UI de The Food Store.

---

## Escenario 1: Redirección de Invitados
**Dado que** un usuario no ha iniciado sesión,
**Cuando** intenta navegar directamente a la URL `/checkout` o `/checkout/success`,
**Entonces** el sistema debe redirigirlo automáticamente a la página de `/login` preservando la ruta previa para redirección post-login.

---

## Escenario 2: Acceso de Clientes Autenticados
**Dado que** un usuario ha iniciado sesión con el rol `CLIENT`,
**Cuando** navega a la URL `/checkout` teniendo productos en el carrito,
**Entonces** el sistema debe cargar la página del Checkout correctamente dentro de `PublicLayout` (con Navbar y Footer).

---

## Escenario 3: Selección y Creación de Direcciones
**Dado que** el cliente se encuentra en la pantalla de `/checkout`,
**Cuando** se renderiza la sección de Dirección de Entrega:
1. Si tiene direcciones guardadas en el backend (`GET /direcciones/`), debe mostrarse un selector claro (con la dirección marcada como principal preseleccionada).
2. Si no tiene direcciones, se debe mostrar un mensaje amigable y un botón destacado para registrar una.
**Y cuando** hace clic en "Nueva Dirección":
1. Debe abrirse un modal premium y transparente.
2. Tras completar los campos obligatorios (Calle y altura, Ciudad) y enviar, se llama a `POST /direcciones/`, se refresca la lista de direcciones del usuario en el checkout y se selecciona automáticamente la nueva dirección.

---

## Escenario 4: Obtención de Métodos de Pago Habilitados
**Dado que** el cliente está en el `/checkout`,
**Cuando** se renderiza la sección de Métodos de Pago,
**Entonces** el sistema debe consultar `GET /pedidos/formas-pago` y renderizar las opciones que vengan con `habilitado: true` en forma de tarjetas seleccionables premium.

---

## Escenario 5: Envío Exitoso del Pedido
**Dado que** el cliente tiene productos en el carrito, ha seleccionado una dirección y un método de pago,
**Cuando** presiona el botón "Confirmar Pedido",
**Entonces**:
1. Se debe deshabilitar el botón y mostrar un indicador de carga animado.
2. Se envía la solicitud `POST /pedidos/` con la serialización correcta de los ítems (excluidos como string separados por comas).
3. Tras recibir la confirmación exitosa del backend:
   - Se vacía el carrito global (`clearCart()`).
   - Se redirige al cliente a `/checkout/success` pasando los datos del pedido en el estado o cargándolos desde el backend usando su ID.

---

## Escenario 6: Validación de Carrito Vacío
**Dado que** el cliente ha vaciado su carrito o ingresa directamente a `/checkout` sin ítems,
**Cuando** intenta acceder a la página,
**Entonces** debe mostrarse un mensaje informativo ("Tu carrito está vacío") y un botón para volver al menú, impidiendo que envíe un pedido vacío.
