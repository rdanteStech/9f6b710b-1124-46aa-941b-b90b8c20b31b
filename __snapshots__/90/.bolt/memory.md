# Gastro360 — SaaS modular omnicanal para gastronomía

## Project Overview
- **App name**: Gastro360
- **Purpose**: Sistema operativo integral para restaurantes, bares, cadenas y dark kitchens
- **Target**: Dueños, gerentes, chefs, mozos, baristas — múltiples roles con RBAC
- **Tech Stack**: React 18, TypeScript, Vite, React Router v6, TailwindCSS 3, lucide-react, recharts
- **Year**: 2025

## User Preferences
- **Theme**: Dark only
- **Background**: `#0a0a0f` (bg), `#12121a` (surface), `#1a1a26` (card)
- **Border**: `#2a2a3d`
- **Palette**: primary `#9E7FFF`, secondary `#38bdf8`, accent `#f472b6`, success `#10b981`, warning `#f59e0b`, error `#ef4444`
- **Typography**: Inter (sans), Playfair Display (display)
- **Visual style**: Rounded 16-24px, glassmorphism, gradient overlays, soft glows
- **Aesthetic**: Futurista dark, premium SaaS

## Architecture Decisions
- **Routing**: React Router v6 with nested routes + Layout wrapper for authed pages
- **State**: React Context (AuthContext) + local component state
- **Auth**: Mock — instant login on form submit
- **Styling**: Tailwind with custom theme tokens (gastro.*), inline styles for dynamic values
- **Mobile First**: Default = mobile (375px). `sm:` `md:` `lg:` `xl:` for progressive enhancement
- **File structure**: `pages/`, `components/`, `context/`, `data/`, `lib/`

## Pages/Modules
- ✅ Landing (`/`)
- ✅ Login (`/login`)
- ✅ Dashboard (`/dashboard`)
- ✅ GastroMenu (`/menu`)
- ✅ GastroServe (`/serve`) — mapa de mesas + KDS + pedidos
- ✅ GastroStock (`/stock`)
- ✅ GastroFinance (`/finance`)
- ✅ GastroTalent (`/talent`) — Equipo, Turnos, Reclutamiento, Organigrama funcional
- ✅ GastroInsight (`/insight`)
- ✅ GastroLoyalty (`/loyalty`)
- ✅ GastroLayout (`/layout`) — editor SVG de zonas con curvas, vértices, fusión
- ✅ GastroWeb (`/web`)
- ✅ GastroNetwork (`/network`)

## Component Registry
- `Layout` — sidebar drawer (mobile) / fixed (desktop), topbar con notifs + hamburger
- `Toast` (portal) — feedback bottom-right
- `EditNodeModal`, `AddPositionModal`, `EditStructurePanel` — modales del organigrama
- `OrgCard` — nodo recursivo del organigrama con scroll horizontal en mobile
- `TableSVG`, `AddTableModal` — del editor GastroLayout

## Mobile First Strategy (CURRENT SESSION)
- **Breakpoints**: 
  - Base: mobile 375px
  - `sm:` 640px (large phones)
  - `md:` 768px (tablet)
  - `lg:` 1024px (laptop)
  - `xl:` 1280px (desktop)
- **Sidebar**: Off-canvas drawer en `<lg`, fixed en `lg+`. Backdrop con blur.
- **Topbar**: Hamburger menu visible solo en `<lg`. Title shrunk en mobile.
- **Grids**: 2 cols mobile → 3-6 cols desktop progresivo
- **Tablas**: Convertidas a cards stack en mobile, tabla tradicional en `md+`
- **Modales**: Bottom-sheet style en mobile (rounded-top, full width), centered modal en `md+`
- **Touch targets**: Mínimo 44×44px (h-11 w-11 o p-3)
- **GastroLayout**: Tools en bottom-sheet/drawer en mobile, sidebar lateral en desktop

## Known Issues & Workarounds
- GastroLayout SVG editor: en mobile el touch drag de mesas/vértices puede ser pequeño — aumentado radius de hitboxes
- Organigrama: scroll horizontal en mobile (overflow-x-auto)

## Session History
- Session 1: Setup inicial, módulos core, Landing, Login, Layout sidebar
- Session 2: GastroPredict separado, GastroTalent con 4 tabs incluyendo Organigrama
- Session 3: Organigrama funcional con modales CRUD, toast feedback
- Session 4: GastroLayout con zonas múltiples, curvas bezier, fusión, imanes
- Session 5 (current): **Mobile First refactor completo** — Layout (sidebar drawer), Dashboard (stacks), GastroServe (cards en mobile), GastroTalent (tabs scrollables), GastroLayout (bottom-sheet tools)
