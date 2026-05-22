# Proposal: 034 — Rediseño Landing (Hero) + Navbar + Página de Perfil

## Estado: Draft

## Motivación

El sitio público tiene tres problemas visuales/funcionales concretos:

1. **Hero recargado**: El componente `HistoricalHero.tsx` acumula demasiados elementos en movimiento simultáneo (sello giratorio, palabras fantasma siguiendo el mouse, ticker inferior, grain, viñeta, líneas de pauta, tracking de mouse). El resultado se siente pesado, no premium.

2. **Navbar con ruido**: El ticker rojo superior es agresivo. Los botones de acción tienen texto innecesario y un posicionamiento hardcodeado frágil. No existe botón de perfil.

3. **Sin página de perfil**: Los usuarios autenticados no tienen dónde ver ni editar sus datos, direcciones o historial de pedidos. Las APIs ya existen (`GET/PATCH /usuarios/me`, `GET /direcciones/`, `POST /direcciones/`, `GET /pedidos/`), solo falta la UI.

## Alcance

### 1. Hero (`HistoricalHero.tsx`)
Solo lo visible above-the-fold al cargar la landing. No se tocan las secciones debajo.

**Eliminar:**
- `ManuscriptSeal` — círculo SVG giratorio con texto orbital
- `GhostWord` x2 — palabras FOLIO/1326 gigantes translúcidas que siguen el mouse
- `BottomTicker` — banda de palabras en loop al pie
- `useMotionValue` + `useSpring` + `useEffect` del mouse tracking
- Grain/noise overlay, viñeta radial, warm amber glow orbital, corner ornaments, líneas de pauta, barra de metadata vacía
- Fondo parchment `#1B120A`

**Nuevo fondo:**
- `#080808` negro profundo puro
- Un único `radial-gradient` naranja-ámbar (`rgba(255,90,0,0.07)`) difuso desde centro-izquierda
- Glow secundario muy tenue en la base inferior

**Mantener y mejorar:**
- Scroll parallax + fade con `useScroll`
- Bloque tipográfico exacto: "ANTES / del fuego, / ya existía / el sabor."
- `OrnamentalRule` (solo una)
- Animaciones de entrada — reducir delays (el texto aparece desde 0.1s, no desde 0.55s)

**Agregar:**
- Eyebrow label: "The Food Store · Est. 2026" (Space Mono, naranja dim)
- CTA al pie del texto: `[ Ver Menú ]` (outline) y `[ Hacer Pedido ]` (sólido naranja)
- Indicador de sección "01 / Hero" vertical a la derecha

### 2. Navbar (`Navbar.tsx`)

**Eliminar:**
- Componente `Ticker` y toda su lógica (la banda roja animada superior)
- El texto "Pedido" del botón del carrito
- El texto "Log In · Register" del botón login
- El texto "Panel" del botón staff
- La lógica `cartRightClass` con valores `right-28`, `right-[260px]` hardcodeados

**Cambios:**
- Tres botones de acción a la derecha en `flex items-center gap-3` fijo
- `ShoppingBag` — carrito, con badge, siempre visible
- `User` — perfil/login:
  - No autenticado → `/login`
  - Autenticado CLIENT → `/perfil`
  - Autenticado staff/admin → `/home`
- `OrbitalButton` — menú fullscreen, sin cambios

**Resultado:** `[Logo]` ← espacio → `[🛒] [👤] [☰]`

### 3. Página de Perfil (`/perfil`)

Nueva página bajo `PublicLayout`, protegida con `AuthProtectedRoute`.

**Secciones:**
- **Datos personales**: nombre, apellido, email (readonly), celular. Editable vía `PATCH /usuarios/me`.
- **Mis direcciones**: lista + formulario para agregar nueva vía `POST /direcciones/`.
- **Mis pedidos**: historial vía `GET /pedidos/` (ya filtra por usuario cuando es CLIENT).

**Diseño**: mismo sistema visual del sitio público — fondo `#0B0B0B`, Cormorant Garamond + Space Mono, acentos naranja.

## Archivos afectados

| Archivo | Acción |
|---------|--------|
| `frontend/src/components/landing/HistoricalHero.tsx` | MODIFY |
| `frontend/src/components/landing/Navbar.tsx` | MODIFY |
| `frontend/src/pages/public/ProfilePage.tsx` | NEW |
| `frontend/src/features/profile/services/profileService.ts` | NEW |
| `frontend/src/router/AppRouter.tsx` | MODIFY |

## Fuera de alcance

- Las secciones debajo del hero (EditorialStatement, VisualBreak, ProductShowcase, etc.) — no se tocan
- Endpoint de delete de direcciones — no existe aún, se puede agregar después
- Página de detalle de pedido individual — no existe, se puede agregar después
