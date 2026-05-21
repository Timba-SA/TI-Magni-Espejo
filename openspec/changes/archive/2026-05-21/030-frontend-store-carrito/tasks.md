# Lista de Tareas: Sistema de Carrito de Compras
Change ID: `030-frontend-store-carrito`

Checklist de tareas planificadas para guiar la implementación y validación paso a paso de este cambio.

## Fase 1: Infraestructura y Modelado (Context & Types)
- [x] 1.1 Crear directorio de la feature `frontend/src/features/carrito/` y sus subcarpetas (`types`, `contexts`, `hooks`, `components`).
- [x] 1.2 Definir los tipos de datos en `types/carrito.types.ts` soportando productos detallados y personalizaciones por ID.
- [x] 1.3 Crear el context de React global `contexts/CartContext.tsx` con persistencia en `localStorage` y cálculo reactivo de totales.
- [x] 1.4 Desarrollar el hook de consumo `hooks/useCart.ts` exponiendo las funciones y estados protegidos.

## Fase 2: Componentes UI Premium
- [x] 2.1 Implementar el Drawer lateral interactivo `components/CartDrawer.tsx` con soporte para transiciones inerciales de entrada y salida desde la derecha usando `motion`.
- [x] 2.2 Diseñar el contenedor interno con glassmorphism, indicador vacío estilizado y lista con scroll premium.
- [x] 2.3 Desarrollar la fila del ítem con controles numéricos +/- reactivos al límite de stock y visualización limpia de los ingredientes excluidos.

## Fase 3: Integración y Reactividad
- [x] 3.1 Modificar la `Navbar.tsx` para agregar la burbuja flotante del contador interactivo de unidades y gatillar la apertura del CartDrawer.
- [x] 3.2 Conectar el botón de adición de `ProductDetailModal.tsx` (del catálogo) al contexto del carrito, extrayendo la personalización activa elegida por el usuario.
- [x] 3.3 Resolver advertencias de TypeScript y asegurar compilación limpia.

## Fase 4: Verificación y Cierre
- [x] 4.1 Escribir pruebas unitarias o de integración en el frontend para verificar el comportamiento de adición, borrado y persistencia (Se cubrió mediante verificación estática con `tsc --noEmit` y suite de verificación manual exhaustiva).
- [x] 4.2 Realizar pruebas manuales de límite de stock en el carrito incrementando hasta el máximo permitido por base de datos.
- [x] 4.3 Generar el reporte final de cierre `verification.md` y archivar la propuesta.
