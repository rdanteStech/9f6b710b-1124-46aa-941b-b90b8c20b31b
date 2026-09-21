# Memoria Gastro360

## User Preferences
- Idioma: español chileno (CLP, +56, Santiago).
- Cliente demo: Trattoria Bellavista.
- No eliminar módulos existentes; solo agregar y reestructurar cuando sea necesario.

## Architecture Decisions
- Estructura: **7 categorías** en el sidebar → Panel · Ventas (Omnicanal) · Operación (Cocina · IA) · Clientes (Fidelización) · Red (Ecosistema · Proveedores) · Talento (Academia) · Finanzas (BI).
- Toda página nueva se registra en `src/data/modules.ts`; `App.tsx` genera rutas dinámicamente.
- Configuración solo desde menú del avatar (no en sidebar).

## Wiring
- Root: `src/main.tsx` → `App.tsx` → providers (Auth · Stock · Serve) → `BrowserRouter` → `Layout` (sidebar + navbar) + rutas.
- Rutas se generan desde `modules.map()` en `App.tsx` — nunca hardcodear rutas.
- `Layout.tsx` lee `modulesByCategory` para renderizar el sidebar agrupado.
- `src/lib/locale.ts` exporta `formatCLP(amount)` — helper de formateo CLP usado por módulos nuevos.

## App entry (src/App.tsx)
Importa: providers (Auth, Serve, Stock), Layout, Landing, Login, Signup, Settings, y `modules` desde `data/modules.ts`. Genera las rutas de módulos con `.map()`.

## Módulos activos (32 total)
- Panel: Dashboard
- Ventas: Serve, Table (NEW), Order, Menu, Web, Go, Connect, Reserve, Events, Fest (NEW)
- Operación: Layout, Eye, Voice (NEW), Sense (NEW), Recipe, Stock, Ops
- Clientes: Clients, Loyalty, Reputation (NEW), Green (NEW)
- Red: Supply, Dark (NEW), Network, Franchise (NEW)
- Talento: Talent, Academy
- Finanzas: Finance, Billing, Insight, Predict

## Known Issues
- **Fixed:** `src/lib/locale.ts` no exportaba `formatCLP` — se agregó el export con `Intl.NumberFormat('es-CL', { currency: 'CLP' })`. Los módulos GastroTable, GastroDark, GastroFest y GastroFranchise dependen de este helper.
