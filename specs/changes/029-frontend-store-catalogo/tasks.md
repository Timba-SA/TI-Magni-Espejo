# Lista de Tareas: Catálogo de Productos Premium (Frontend)
Change ID: `029-frontend-store-catalogo`

Checklist de tareas planificadas para guiar la implementación y validación paso a paso de este cambio.

## Fase 1: Infraestructura y Modelado
- [ ] 1.1 Crear directorio de la feature `frontend/src/features/catalogo/` y sus subcarpetas (`types`, `services`, `components`).
- [ ] 1.2 Definir los tipos de datos dinámicos en `types/catalogo.types.ts` alineados con los esquemas de base de datos del backend.
- [ ] 1.3 Desarrollar las funciones del servicio `services/catalogoService.ts` utilizando el cliente `fetchApi` centralizado del proyecto.

## Fase 2: Componentes y Estilos Premium
- [ ] 2.1 Implementar el esqueleto animado de carga `components/LoadingSkeleton.tsx` usando transiciones shimmer fluidas de Tailwind.
- [ ] 2.2 Crear el componente `components/ProductoCard.tsx` aplicando efectos de glassmorphism, hover 3D interactivo y control de etiquetas de stock.
- [ ] 2.3 Desarrollar el modal inmersivo `components/ProductDetailModal.tsx` con soporte para selección interactiva de ingredientes removibles.

## Fase 3: Integración y Cableado
- [ ] 3.1 Ensamblar el componente principal `components/CatalogoExperience.tsx` unificando la lógica de categorías, carga y el filtrado por categorías.
- [ ] 3.2 Modificar el punto de entrada de la carta pública `frontend/src/pages/public/MenuPage.tsx` reemplazando la importación de `MenuExperience` estática por el nuevo catálogo dinámico.
- [ ] 3.3 Resolver cualquier advertencia de tipado en TypeScript y verificar compilación correcta.

## Fase 4: Verificación y Pruebas
- [ ] 4.1 Iniciar el frontend localmente y validar la carga de productos reales desde la base de datos de SQLite.
- [ ] 4.2 Probar los filtros por categoría haciendo clic en cada pestaña y corroborar la correcta transición de fondos HSL degradados.
- [ ] 4.3 Abrir el modal de detalle de un producto y validar que los ingredientes marcados como removibles puedan quitarse correctamente, conservando el estado en consola.
- [ ] 4.4 Redactar el reporte de cierre `verification.md` para cerrar el ciclo SDD.
