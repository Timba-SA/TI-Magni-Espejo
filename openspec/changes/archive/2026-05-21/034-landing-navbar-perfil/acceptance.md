# Acceptance Criteria: 034 — Rediseño Landing (Hero) + Navbar + Página de Perfil

## Hero

- [ ] AC-01: El hero NO muestra ningún elemento giratorio ni ticker inferior
- [ ] AC-02: El fondo es negro profundo (`#080808`), sin grain visible, sin viñeta marrón
- [ ] AC-03: El texto "ANTES / del fuego, / ya existía / el sabor." es visible y legible
- [ ] AC-04: El texto aparece con animación de reveal antes de los 600ms
- [ ] AC-05: Los botones "Ver Menú" y "Hacer Pedido" son visibles y navegan correctamente
- [ ] AC-06: El hero hace parallax + fade al hacer scroll hacia abajo

## Navbar

- [ ] AC-07: NO existe el ticker rojo animado en la parte superior de la pantalla
- [ ] AC-08: Los tres botones (carrito, perfil, menú) están alineados a la derecha sin texto visible
- [ ] AC-09: El carrito muestra badge con cantidad cuando hay items en el carrito
- [ ] AC-10: Usuario no autenticado — clic en 👤 navega a `/login`
- [ ] AC-11: Usuario autenticado como CLIENT — clic en 👤 navega a `/perfil`
- [ ] AC-12: Usuario autenticado como staff/admin — clic en 👤 navega a `/home`
- [ ] AC-13: El menú fullscreen (OrbitalButton) funciona igual que antes

## Página de Perfil

- [ ] AC-14: `/perfil` sin sesión redirige a `/login`
- [ ] AC-15: `/perfil` con sesión muestra nombre y rol del usuario en el header
- [ ] AC-16: La sección "Datos Personales" carga y muestra los datos del usuario
- [ ] AC-17: El formulario de edición guarda cambios con `PATCH /usuarios/me` y muestra feedback
- [ ] AC-18: La sección "Mis Direcciones" lista las direcciones del usuario
- [ ] AC-19: El formulario de nueva dirección crea una dirección con `POST /direcciones/`
- [ ] AC-20: La sección "Mis Pedidos" lista los pedidos del usuario con estado y fecha
