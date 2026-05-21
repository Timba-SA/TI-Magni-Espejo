# Diseño Técnico: Catálogo de Productos Premium (Frontend)
Change ID: `029-frontend-store-catalogo`

Este documento detalla la arquitectura, el diseño de componentes, la interacción de estados y el flujo de llamadas de red para el Catálogo de Productos Premium de **The Food Store**.

## Arquitectura de la Feature
Crearemos un módulo autocontenido para el catálogo de clientes dentro de `frontend/src/features/catalogo/`. Esto asegura una separación estricta entre la vista pública de compras y la lógica administrativa del backend.

```
frontend/src/features/catalogo/
├── types/
│   └── catalogo.types.ts
├── services/
│   └── catalogoService.ts
└── components/
    ├── CatalogoExperience.tsx     # Contenedor y flujo principal (reemplazo de MenuExperience)
    ├── ProductoCard.tsx           # Tarjeta individual con efectos visuales premium
    ├── ProductDetailModal.tsx     # Modal/Drawer interactivo con ingredientes personalizables
    └── LoadingSkeleton.tsx        # Brillo Shimmer premium para cargas
```

## Estructura de Datos (Types)
Definiremos los tipos en `catalogo.types.ts` mapeando con exactitud los esquemas JSON de la API del backend:

```typescript
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  is_active: boolean;
}

export interface Ingrediente {
  id: number;
  nombre: string;
  es_removible: boolean;
}

export interface ProductoIngrediente {
  ingrediente_id: number;
  es_removible: boolean;
  ingrediente?: Ingrediente;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number; // Mapeado a número tras serialización del Decimal
  imagenes_url: string[];
  stock_cantidad: number;
  disponible: boolean;
  ingredientes?: ProductoIngrediente[];
}
```

## Servicios de API (`catalogoService.ts`)
Consumiremos los endpoints de productos y categorías utilizando `fetchApi`:

* **`getCatalogoCategorias`**: Obtiene las categorías activas a mostrar.
  `GET /categorias?limit=100` (filtramos en el frontend las que tengan `is_active === true`).
* **`getCatalogoProductos`**: Obtiene los productos activos para la tienda.
  `GET /productos?limit=100&disponible=true`

```typescript
import { fetchApi } from "@/shared/api/apiClient";
import type { Categoria, Producto } from "../types/catalogo.types";

export async function getActiveCategorias(): Promise<Categoria[]> {
  const res = await fetchApi<{ items: Categoria[] }>("/categorias?limit=100");
  return res.items.filter(c => c.is_active);
}

export async function getActiveProductos(): Promise<Producto[]> {
  // Obtenemos solo productos disponibles
  return fetchApi<Producto[]>("/productos?limit=100&disponible=true");
}
```

## Diseño UI/UX Premium (Tailwind CSS v4 & Framer Motion)

### 1. Fondos y Transiciones Dinámicas (Tailwind HSL Tailored Colors)
* Mantendremos la animación de degradados de color en base a la categoría seleccionada para conservar la inmersión del diseño original.
* Usaremos los acentos premium para cada pestaña activa:
  * Especiales/Platos principales: `#FF5A00` (Naranja magma)
  * Bebidas: `#C1121F` (Rojo borgoña)
  * Postres/Otros: `#D4A574` (Dorado arena)

### 2. Glassmorphism en Cards y Modales
* Las tarjetas de productos tendrán bordes ultra-delgados con opacidades sutiles (`border-white/[0.06]`), desenfoque de fondo (`backdrop-blur-md`) y gradientes de brillo en estado `:hover`.
* Implementaremos el esqueleto de carga (`LoadingSkeleton`) usando un shimmer animado mediante CSS puro en Tailwind.

### 3. Modal de Detalle Interactivo (Ingredientes Personalizables)
Al hacer clic en un producto:
* Se abrirá un **Modal o Drawer** premium en dispositivos móviles, cargando dinámicamente los ingredientes mediante Framer Motion.
* Si el producto tiene ingredientes marcados como `es_removible: true`, mostraremos un selector interactivo (checkboxes estilizados tipo chip) para que el usuario pueda desmarcarlo e indicar que desea quitar ese ingrediente (ej. *"Sin cebolla"* o *"Sin panceta"*).
* Esta selección de ingredientes removidos se guardará en el estado temporal local del producto (clave para el carrito de compras posterior).

## Transiciones y Micro-animaciones
* **Tabs**: Movimiento del underline usando `layoutId="active-tab"` de Framer Motion.
* **Entrada de Productos**: Animación por cascada usando propiedades stagger (`delay: i * 0.05`).
* **Hover de Tarjetas**: Escalado sutil (`scale: 1.02`), translación del título y brillo orbital reflectivo.

---
¿Apruebas este diseño técnico detallado para continuar con los Criterios de Aceptación?
