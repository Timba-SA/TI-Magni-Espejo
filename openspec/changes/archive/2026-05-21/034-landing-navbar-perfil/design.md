# Design: 034 — Rediseño Landing (Hero) + Navbar + Página de Perfil

## Arquitectura de componentes

```
PublicLayout
├── Navbar (modificado)
│   ├── Logo TFS (sin cambios)
│   ├── [botones derecha — flex row]
│   │   ├── CartButton (solo ícono ShoppingBag + badge)
│   │   ├── ProfileButton (User icon → /login | /perfil | /home)
│   │   └── OrbitalButton (sin cambios)
│   └── FullScreenMenu (sin cambios)
├── LandingPage
│   ├── HistoricalHero (rediseñado)  ← este change
│   ├── EditorialStatement           ← sin tocar
│   ├── VisualBreak                  ← sin tocar
│   ├── ProductShowcase              ← sin tocar
│   ├── HorizontalExplorer           ← sin tocar
│   ├── MenuExperience               ← sin tocar
│   └── EditorialCTA                 ← sin tocar
└── ProfilePage (nueva)
    ├── ProfileHeader (nombre + rol)
    ├── DatosPersonalesSection
    ├── DireccionesSection
    └── PedidosSection
```

## Decisiones de diseño

### Hero — Filosofía "texto como escultura"
El principio rector es que **el texto es el único objeto visual**. Un fondo negro puro sin distracciones hace que la tipografía masiva de Cormorant Garamond tenga el mayor contraste y peso visual posible. El único glow funciona como iluminación de escena, no como decoración.

- **Background**: `#080808` (no `#000`, tiene un toque cálido pero casi imperceptible)
- **Glow**: `radial-gradient ellipse 70% 60% at 30% 60%` — centrado donde está el texto, empuja hacia la izquierda que es donde mira el ojo primero
- **Glow secundario**: en la base, da sensación de profundidad sin ser obvio
- **Tipografía**: mismas reglas — Cormorant 700 para "ANTES" y "el sabor.", 300 italic para "del fuego,", 400 italic naranja para "ya existía"
- **CTA**: dos botones al pie — outline naranja (ver menú) y sólido naranja (hacer pedido)

### Navbar — Sistema de íconos
Reemplazar todos los botones de texto por íconos de `lucide-react`. La decisión de mostrar 3 íconos alineados en un `flex row` con `gap-3` elimina la necesidad de calcular posiciones absolutas y hace el código mantenible.

```tsx
// Antes (frágil):
let cartRightClass = "right-28";
if (!isAuthenticated) cartRightClass = "right-[260px]";
else if (user?.rol !== "CLIENT") cartRightClass = "right-[210px]";

// Después (robusto):
<div className="fixed top-7 right-8 z-[200] flex items-center gap-3">
  <CartButton />
  <ProfileButton />
  <OrbitalButton />
</div>
```

### ProfileButton — Lógica de navegación
```
isAuthenticated === false  →  Link to "/login"    (ícono User color dorado)
isAuthenticated + CLIENT   →  Link to "/perfil"   (ícono User color naranja)
isAuthenticated + staff    →  Link to "/home"     (ícono LayoutDashboard color naranja + dot pulse)
```

### ProfilePage — Layout y servicios
La página vive bajo `PublicLayout` (no `AdminLayout`) porque el cliente no tiene acceso al panel admin. Usa `AuthProtectedRoute` para redirigir a `/login` si no hay sesión.

**Servicio**: `profileService.ts` agrupa 3 fuentes de datos en un único lugar:
```ts
// GET /usuarios/me        → datos personales
// PATCH /usuarios/me      → editar datos
// GET /direcciones/       → direcciones (reutiliza checkoutService)
// POST /direcciones/      → nueva dirección (reutiliza checkoutService)
// GET /pedidos/           → pedidos del usuario
```

Internamente reutiliza funciones de `checkoutService.ts` para no duplicar código.

**Layout de la página**:
- Header: avatar inicial + nombre + rol badge
- Tabs (3): Datos Personales / Mis Direcciones / Mis Pedidos
- Cada tab es una sección lazy — carga su data solo cuando se activa

## Consideraciones técnicas

- `Ticker` se elimina del JSX de `Navbar` y el componente se puede borrar del archivo (no se usa en otro lado)
- `useMotionValue`, `useSpring`, `useEffect` del mouse tracking se eliminan de `HistoricalHero` — los imports quedan limpios
- La ruta `/perfil` se agrega dentro del bloque `PublicLayout` de `AppRouter.tsx`, envuelta en `AuthProtectedRoute`
- `profileService.ts` se crea en `src/features/profile/services/` siguiendo la arquitectura por features
- Los tipos `UsuarioDetailResponse` y `PedidoResponse` ya existen en sus respectivos módulos del backend — en el frontend se pueden tipar inline o crear un `profile.types.ts`

## Sin cambios

- `FullScreenMenu` y sus `MagneticLink` — el menú fullscreen queda exactamente igual
- Todas las secciones de la landing debajo del hero
- Cualquier lógica de auth o contexto
