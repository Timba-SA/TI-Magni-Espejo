# Propuesta de Cambio: Sistema de Carrito de Compras en el Frontend
Change ID: `030-frontend-store-carrito`
Estado: Draft

## 1. Contexto y Objetivos
Para continuar con la construcción del embudo de compras de **The Food Store**, necesitamos implementar un **Sistema de Carrito de Compras** en el Frontend. Este sistema debe ser global, dinámico, reactivo y persistente, sirviendo de nexo entre el Catálogo de Productos y el posterior flujo de Checkout.

### Objetivos:
- Proveer un estado global de carrito accesible desde cualquier componente (Navbar pública, Catálogo y Checkout).
- Soportar la **personalización única de productos** (si un producto tiene ingredientes removidos diferentes, debe considerarse una línea de carrito independiente).
- Persistir el carrito en `localStorage` de forma segura para no perder la selección al recargar.
- Ofrecer una UI premium (Glassmorphism, Dark mode) a través de un Drawer lateral de carrito interactivo de acceso rápido.
- Controlar dinámicamente la validación de stock antes de agregar o incrementar cantidades en el carrito.

---

## 2. Cambios Propuestos

### Frontend:
- **`[NEW]` `frontend/src/features/carrito/types/carrito.types.ts`**: Definición de tipos para `CartItem` y el estado del carrito.
- **`[NEW]` `frontend/src/features/carrito/contexts/CartContext.tsx`**: Contexto React global para el manejo reactivo del carrito.
- **`[NEW]` `frontend/src/features/carrito/hooks/useCart.ts`**: Custom hook simplificado para consumir el contexto de carrito.
- **`[NEW]` `frontend/src/features/carrito/components/CartDrawer.tsx`**: Drawer lateral inmersivo deslizable para ver, editar cantidades, quitar elementos y ver el total de la compra.
- **`[MODIFY]` `frontend/src/components/layout/Navbar.tsx`** o donde esté la barra de navegación: Integrar el indicador del carrito con contador de ítems flotante que despliega el `CartDrawer` al hacer clic.
- **`[MODIFY]` `frontend/src/features/catalogo/components/ProductDetailModal.tsx`**: Conectar el botón "Agregar al Carrito" con la acción global del contexto, inyectando la personalización de ingredientes removidos.

---

## 3. Plan de Rollback y Tradeoffs

### Tradeoffs:
- **Agrupamiento vs. Separación**: Agrupar los ítems solo si coinciden en ID de producto y personalización (ingredientes removidos). Si no coinciden, se mantienen separados. Esto incrementa ligeramente la complejidad del algoritmo de adición (`addItem`), pero garantiza la flexibilidad de la personalización de comida real.
- **Persistencia en LocalStorage vs. API temporal**: La persistencia en `localStorage` es ideal para usuarios anónimos rápidos y reduce la carga del backend de forma drástica, pero no se sincroniza entre dispositivos si el usuario cambia de navegador. Dado el stack actual, `localStorage` es el tradeoff óptimo.

### Plan de Rollback:
- En caso de fallos graves en el flujo, se puede desactivar la inyección del `CartProvider` en el punto de entrada de la app y restaurar la Navbar original. Todo el código nuevo está autocontenido dentro de `frontend/src/features/carrito/`.

---
¿Apruebas esta propuesta inicial para redactar las especificaciones y el diseño técnico detallado?
