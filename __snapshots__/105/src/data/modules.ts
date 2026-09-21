import type { ComponentType } from 'react';
import {
  LayoutDashboard, ShoppingCart, ChefHat, Users, BarChart3, DollarSign,
  Package, Calendar, Utensils, Menu, Bot, TrendingUp, Award, Truck,
  Globe, Eye, MapPin, Boxes, GraduationCap, Network, Heart, Sparkles,
  Receipt, QrCode, Headphones, Thermometer, Layers, Leaf, Radio, Building2
} from 'lucide-react';

import Dashboard from '../pages/Dashboard';
import GastroServe from '../pages/GastroServe';
import GastroOrder from '../pages/GastroOrder';
import GastroStock from '../pages/GastroStock';
import GastroRecipe from '../pages/GastroRecipe';
import GastroFinance from '../pages/GastroFinance';
import GastroInsight from '../pages/GastroInsight';
import GastroPredict from '../pages/GastroPredict';
import GastroTalent from '../pages/GastroTalent';
import GastroAcademy from '../pages/GastroAcademy';
import GastroReserve from '../pages/GastroReserve';
import GastroEvents from '../pages/GastroEvents';
import GastroMenu from '../pages/GastroMenu';
import GastroLayout from '../pages/GastroLayout';
import GastroEye from '../pages/GastroEye';
import GastroLoyalty from '../pages/GastroLoyalty';
import GastroSupply from '../pages/GastroSupply';
import GastroNetwork from '../pages/GastroNetwork';
import GastroOps from '../pages/GastroOps';
import GastroWeb from '../pages/GastroWeb';
import GastroGo from '../pages/GastroGo';
import GastroConnect from '../pages/GastroConnect';
import GastroClients from '../pages/GastroClients';
import Billing from '../pages/Billing';
import GastroTable from '../pages/GastroTable';
import GastroVoice from '../pages/GastroVoice';
import GastroSense from '../pages/GastroSense';
import GastroDark from '../pages/GastroDark';
import GastroReputation from '../pages/GastroReputation';
import GastroGreen from '../pages/GastroGreen';
import GastroFest from '../pages/GastroFest';
import GastroFranchise from '../pages/GastroFranchise';

export type ModuleCategory =
  | 'panel'
  | 'ventas'
  | 'operaciones'
  | 'clientes'
  | 'red'
  | 'talento'
  | 'finanzas';

export interface ModuleDefinition {
  id: string;
  path: string;
  label: string;
  category: ModuleCategory;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType;
  description: string;
  badges?: string[];
  requiredPermission?: string;
}

export const modules: ModuleDefinition[] = [
  // PANEL
  {
    id: 'dashboard', path: '/dashboard', label: 'Dashboard',
    category: 'panel', icon: LayoutDashboard, component: Dashboard,
    description: 'Vista consolidada del restaurante en vivo'
  },

  // VENTAS (Omnicanal)
  {
    id: 'serve', path: '/serve', label: 'GastroServe',
    category: 'ventas', icon: ShoppingCart, component: GastroServe,
    description: 'POS · KDS · Salón unificado'
  },
  {
    id: 'table', path: '/table', label: 'GastroTable',
    category: 'ventas', icon: QrCode, component: GastroTable,
    description: 'Carta QR colaborativa · división de cuenta · NFC del garzón',
    badges: ['NEW']
  },
  {
    id: 'order', path: '/order', label: 'GastroOrder',
    category: 'ventas', icon: Utensils, component: GastroOrder,
    description: 'Pedidos digitales y kiosco de autoatención'
  },
  {
    id: 'menu', path: '/menu', label: 'GastroMenu',
    category: 'ventas', icon: Menu, component: GastroMenu,
    description: 'Ingeniería de cartas y precios inteligentes'
  },
  {
    id: 'web', path: '/web', label: 'GastroWeb',
    category: 'ventas', icon: Globe, component: GastroWeb,
    description: 'Creador de sitios web por marca (SaaS white-label)'
  },
  {
    id: 'go', path: '/go', label: 'GastroGo',
    category: 'ventas', icon: Truck, component: GastroGo,
    description: 'Delivery propio · ruteo · repartidores'
  },
  {
    id: 'connect', path: '/connect', label: 'GastroConnect',
    category: 'ventas', icon: Network, component: GastroConnect,
    description: 'Hub centralizado de delivery (Channel Manager)'
  },
  {
    id: 'reserve', path: '/reserve', label: 'GastroReserve',
    category: 'ventas', icon: Calendar, component: GastroReserve,
    description: 'Reservas online e in-house · cuentas B2B · catering'
  },
  {
    id: 'events', path: '/events', label: 'GastroEvents',
    category: 'ventas', icon: Award, component: GastroEvents,
    description: 'Cotizador de eventos privados y matrimonios'
  },
  {
    id: 'fest', path: '/fest', label: 'GastroFest',
    category: 'ventas', icon: Radio, component: GastroFest,
    description: 'Festivales cashless NFC/RFID · aforo QR',
    badges: ['NEW']
  },

  // OPERACIONES (Cocina · Layout · IA)
  {
    id: 'layout', path: '/layout', label: 'GastroLayout',
    category: 'operaciones', icon: MapPin, component: GastroLayout,
    description: 'Diseñador de layout · zonas · acoplamiento inteligente de mesas'
  },
  {
    id: 'eye', path: '/eye', label: 'GastroEye',
    category: 'operaciones', icon: Eye, component: GastroEye,
    description: 'Visión artificial en tiempo real · alertas al garzón',
    badges: ['AI']
  },
  {
    id: 'voice', path: '/voice', label: 'GastroVoice',
    category: 'operaciones', icon: Headphones, component: GastroVoice,
    description: 'Voice-KDS · comandos por voz en cocina',
    badges: ['AI', 'NEW']
  },
  {
    id: 'sense', path: '/sense', label: 'GastroSense',
    category: 'operaciones', icon: Thermometer, component: GastroSense,
    description: 'Sensores IoT · HACCP automático · temperatura de cámaras',
    badges: ['IoT', 'NEW']
  },
  {
    id: 'recipe', path: '/recipe', label: 'GastroRecipe',
    category: 'operaciones', icon: ChefHat, component: GastroRecipe,
    description: 'Recetas · fichas técnicas · costos y precios',
    badges: ['AI']
  },
  {
    id: 'stock', path: '/stock', label: 'GastroStock',
    category: 'operaciones', icon: Package, component: GastroStock,
    description: 'Inventario en tiempo real · mermas · food cost'
  },
  {
    id: 'ops', path: '/ops', label: 'GastroOps',
    category: 'operaciones', icon: Boxes, component: GastroOps,
    description: 'Operación diaria · turnos · checklists'
  },

  // CLIENTES (CRM · Fidelización · Reputación)
  {
    id: 'clients', path: '/clients', label: 'GastroClients',
    category: 'clientes', icon: Users, component: GastroClients,
    description: 'CRM · historial · preferencias · alergias · perfiles VIP'
  },
  {
    id: 'loyalty', path: '/loyalty', label: 'GastroLoyalty',
    category: 'clientes', icon: Heart, component: GastroLoyalty,
    description: 'Puntos · cashback · gift cards · suscripciones · WhatsApp'
  },
  {
    id: 'reputation', path: '/reputation', label: 'GastroReputation',
    category: 'clientes', icon: Sparkles, component: GastroReputation,
    description: 'Reputación unificada · Google · TripAdvisor · respuestas IA',
    badges: ['NEW']
  },
  {
    id: 'green', path: '/green', label: 'GastroGreen',
    category: 'clientes', icon: Leaf, component: GastroGreen,
    description: 'Huella de carbono · Sello Verde · economía circular',
    badges: ['NEW']
  },

  // RED & ECOSISTEMA (Proveedores · Multi-marca · Franquicias)
  {
    id: 'supply', path: '/supply', label: 'GastroSupply',
    category: 'red', icon: Truck, component: GastroSupply,
    description: 'Marketplace de proveedores · cotizaciones · OC'
  },
  {
    id: 'dark', path: '/dark', label: 'GastroDark',
    category: 'red', icon: Layers, component: GastroDark,
    description: 'Virtual Brands Hub · dark kitchens · inventario compartido',
    badges: ['NEW']
  },
  {
    id: 'network', path: '/network', label: 'GastroNetwork',
    category: 'red', icon: Building2, component: GastroNetwork,
    description: 'Red de locales · traspasos entre sucursales'
  },
  {
    id: 'franchise', path: '/franchise', label: 'GastroFranchise',
    category: 'red', icon: Award, component: GastroFranchise,
    description: 'Franquicias · royalties · central de compras corporativa',
    badges: ['NEW']
  },

  // TALENTO (RRHH · Red social · Academia)
  {
    id: 'talent', path: '/talent', label: 'GastroTalent',
    category: 'talento', icon: Users, component: GastroTalent,
    description: 'Red social de talento · matching IA · organigrama · ficha personal',
    badges: ['AI']
  },
  {
    id: 'academy', path: '/academy', label: 'GastroAcademy',
    category: 'talento', icon: GraduationCap, component: GastroAcademy,
    description: 'Capacitaciones · certificaciones · rotación inteligente'
  },

  // FINANZAS & BI
  {
    id: 'finance', path: '/finance', label: 'GastroFinance',
    category: 'finanzas', icon: DollarSign, component: GastroFinance,
    description: 'Facturación · caja · propinas · conciliación bancaria'
  },
  {
    id: 'billing', path: '/billing', label: 'Billing',
    category: 'finanzas', icon: Receipt, component: Billing,
    description: 'Suscripción Gastro360 · facturas SaaS'
  },
  {
    id: 'insight', path: '/insight', label: 'GastroInsight',
    category: 'finanzas', icon: BarChart3, component: GastroInsight,
    description: 'Inteligencia de negocios · KPIs · dashboards',
    badges: ['AI']
  },
  {
    id: 'predict', path: '/predict', label: 'GastroPredict',
    category: 'finanzas', icon: TrendingUp, component: GastroPredict,
    description: 'Predicción de demanda · labor cost · panel global IA',
    badges: ['AI']
  }
];

export const moduleGroups: { id: ModuleCategory; label: string }[] = [
  { id: 'panel', label: 'Panel' },
  { id: 'ventas', label: 'Ventas · Omnicanal' },
  { id: 'operaciones', label: 'Operación · Cocina · IA' },
  { id: 'clientes', label: 'Clientes · Fidelización' },
  { id: 'red', label: 'Red · Ecosistema · Proveedores' },
  { id: 'talento', label: 'Talento · Academia' },
  { id: 'finanzas', label: 'Finanzas · BI' }
];

export const modulesByCategory = moduleGroups.map(g => ({
  ...g,
  items: modules.filter(m => m.category === g.id)
}));

export const getModuleById = (id: string) => modules.find(m => m.id === id);
