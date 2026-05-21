# Technical Design: Checkout y Confirmación en el Frontend (031-frontend-store-checkout)

Este documento describe la arquitectura y decisiones de diseño técnico para la implementación de la pantalla de Checkout e integración de Pedidos/Direcciones en The Food Store.

---

## 1. Arquitectura de Componentes y Páginas

La estructura de carpetas seguirá el patrón de la arquitectura por features establecida:

```
frontend/src/features/checkout/
├── components/
│   ├── AddressSelector.tsx      # Listado de direcciones y selección
│   ├── NewAddressModal.tsx      # Modal glassmorphic para registrar dirección
│   ├── PaymentSelector.tsx     # Selector de métodos de pago dinámicos
│   └── CheckoutSummary.tsx      # Resumen lateral de productos y totales
├── services/
│   └── checkoutService.ts       # Consumo de /pedidos y /direcciones
└── types/
    └── checkout.types.ts        # Interfaces estrictas de TypeScript
```

Y las vistas de nivel de página en `frontend/src/pages/checkout/`:
```
frontend/src/pages/checkout/
├── CheckoutPage.tsx             # Pantalla principal de checkout
└── OrderSuccessPage.tsx         # Pantalla de confirmación de pedido exitoso
```

---

## 2. Tipado Estricto de TypeScript (`checkout.types.ts`)

Definiremos interfaces alineadas de forma exacta con los esquemas Pydantic del backend:

```typescript
// --- Direcciones ---
export interface Direccion {
  id: number;
  usuario_id: number;
  alias?: string;
  linea1: string;
  linea2?: string;
  ciudad: string;
  provincia?: string;
  codigo_postal?: string;
  es_principal: boolean;
  created_at: string;
}

export interface DireccionCreateRequest {
  alias?: string;
  linea1: string;
  linea2?: string;
  ciudad: string;
  provincia?: string;
  codigo_postal?: string;
}

// --- Formas de Pago ---
export interface FormaPago {
  codigo: string;
  descripcion: string;
  habilitado: boolean;
}

// --- Pedidos ---
export interface ItemPedidoRequest {
  producto_id: number;
  cantidad: number;
  personalizacion?: string; // Excluidos serializados por comas (ej. "1,3")
}

export interface CrearPedidoRequest {
  items: ItemPedidoRequest[];
  direccion_id?: number;
  forma_pago_codigo: string;
  notas?: string;
}

export interface DetallePedido {
  id?: number;
  producto_id: number;
  cantidad: number;
  nombre_snapshot: str;
  precio_snapshot: number;
  subtotal_snap: number;
  personalizacion?: string;
}

export interface PedidoResponse {
  id: number;
  usuario_id: number;
  direccion_id?: number;
  estado_codigo: string;
  forma_pago_codigo: string;
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  notas?: string;
  created_at: string;
  updated_at: string;
  detalles: DetallePedido[];
}
```

---

## 3. Integración de API (`checkoutService.ts`)

El servicio utilizará el cliente de fetch existente o Axios (según se use en el frontend, investigaremos qué cliente de red usa el proyecto) con la URL base centralizada para realizar llamadas authenticated:

- `listarDirecciones()`: `GET /direcciones/`
- `crearDireccion(data)`: `POST /direcciones/`
- `listarFormasPago()`: `GET /pedidos/formas-pago`
- `crearPedido(data)`: `POST /pedidos/`

---

## 4. Guardia de Autenticación (`AuthProtectedRoute.tsx`)

Crearemos una nueva guardia de ruta específica para vistas orientadas al cliente que requieren autenticación.
Ubicación: `frontend/src/router/AuthProtectedRoute.tsx`

```tsx
import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { isAuthenticated } from "@/features/auth/services/authService";

interface AuthProtectedRouteProps {
  children: ReactNode;
}

export function AuthProtectedRoute({ children }: AuthProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirige al login guardando la ubicación original para regresar tras autenticarse
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

## 5. Diseño Estético y Visual Premium

- **Glassmorphism y Estilo Oscuro:** Usaremos fondo semi-transparente difuminado (`backdrop-blur-md bg-neutral-900/60 border border-white/10`), sombras suaves y gradientes elegantes para mantener la coherencia con el catálogo y Navbar.
- **Micro-animaciones (Framer Motion 12):**
  - Entradas de componentes fluidas (`motion.div` con `initial={{ opacity: 0, y: 15 }}`).
  - Botón de envío con estado de carga ("loader" giratorio y cambio de texto suave).
- **Responsive Fluid Grid:**
  - Formulario de datos en la parte izquierda (o arriba en mobile) ocupando 7/12 columnas.
  - Resumen de compra persistente pegado a la derecha en desktop ocupando 5/12 columnas.

---

## 6. Manejo de Flujo de Negocio y MercadoPago

Cuando el usuario elija "MERCADOPAGO" como forma de pago:
1. El backend creará el pedido en estado `PENDIENTE_PAGO` y registrará una preferencia en MercadoPago (del cambio `024`).
2. En una etapa inicial o básica, si el backend retorna datos de MercadoPago (como un link de pago), redirigiremos al usuario a dicho link. Si no, en la pantalla de éxito le mostraremos un botón "Pagar con MercadoPago" o similar.
3. Si el usuario elije "EFECTIVO", el pedido se crea directamente y se notifica su estado inicial (ej. `INGRESADO` o `PENDIENTE_APROBACION`).
