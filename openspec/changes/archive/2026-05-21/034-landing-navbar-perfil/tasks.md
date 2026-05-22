# Tasks: 034 — Rediseño Landing (Hero) + Navbar + Página de Perfil

## Hero

- [x] T-01: Eliminar `ManuscriptSeal`, `GhostWord`, `BottomTicker` y sus helpers
- [x] T-02: Eliminar mouse tracking (`useMotionValue`, `useSpring`, `useEffect`)
- [x] T-03: Eliminar grain overlay, viñeta, corner ornaments, líneas de pauta, metadata bar
- [x] T-04: Nuevo fondo `#080808` con glow naranja único
- [x] T-05: Mantener bloque tipográfico con delays reducidos
- [x] T-06: Agregar eyebrow label, CTA buttons e indicador de sección

## Navbar

- [x] T-07: Eliminar componente `Ticker` y su uso en el JSX
- [x] T-08: Reestructurar botones derecha en `flex row` fijo — eliminar `cartRightClass`
- [x] T-09: Simplificar `CartButton` — solo ícono + badge, sin texto "Pedido"
- [x] T-10: Reemplazar `LoginButton` y `PanelButton` por `ProfileButton` con lógica de navegación según rol

## Perfil

- [x] T-11: Crear `src/features/profile/services/profileService.ts`
- [x] T-12: Crear `src/pages/public/ProfilePage.tsx` con tabs y 3 secciones
- [x] T-13: Agregar ruta `/perfil` en `AppRouter.tsx` con `AuthProtectedRoute`
