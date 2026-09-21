import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AppShell from './pages/AppShell';

const Dashboard = lazy(() => import('./pages/Dashboard').catch(() => ({ default: PlaceholderPage('Dashboard') })));
const POS = lazy(() => import('./pages/POS').catch(() => ({ default: PlaceholderPage('Punto de Venta') })));
const Tables = lazy(() => import('./pages/Tables').catch(() => ({ default: PlaceholderPage('Mesas') })));
const Kitchen = lazy(() => import('./pages/Kitchen').catch(() => ({ default: PlaceholderPage('Cocina') })));
const Orders = lazy(() => import('./pages/Orders').catch(() => ({ default: PlaceholderPage('Pedidos') })));
const Reservations = lazy(() => import('./pages/Reservations').catch(() => ({ default: PlaceholderPage('Reservas') })));
const Menu = lazy(() => import('./pages/Menu').catch(() => ({ default: PlaceholderPage('Menú') })));
const Inventory = lazy(() => import('./pages/Inventory').catch(() => ({ default: PlaceholderPage('Inventario') })));
const Suppliers = lazy(() => import('./pages/Suppliers').catch(() => ({ default: PlaceholderPage('Proveedores') })));
const Customers = lazy(() => import('./pages/Customers').catch(() => ({ default: PlaceholderPage('Clientes') })));
const Staff = lazy(() => import('./pages/Staff').catch(() => ({ default: PlaceholderPage('Personal') })));
const Billing = lazy(() => import('./pages/Billing').catch(() => ({ default: PlaceholderPage('Facturación') })));
const Finance = lazy(() => import('./pages/Finance').catch(() => ({ default: PlaceholderPage('Finanzas') })));
const Reports = lazy(() => import('./pages/Reports').catch(() => ({ default: PlaceholderPage('Reportes') })));
const Branches = lazy(() => import('./pages/Branches').catch(() => ({ default: PlaceholderPage('Sucursales') })));
const SettingsPage = lazy(() => import('./pages/Settings').catch(() => ({ default: PlaceholderPage('Configuración') })));

function PlaceholderPage(title: string) {
  return function Placeholder() {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-600">Módulo en construcción.</p>
      </div>
    );
  };
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="pos"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <POS />
            </Suspense>
          }
        />
        <Route
          path="tables"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Tables />
            </Suspense>
          }
        />
        <Route
          path="kitchen"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Kitchen />
            </Suspense>
          }
        />
        <Route
          path="orders"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Orders />
            </Suspense>
          }
        />
        <Route
          path="reservations"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Reservations />
            </Suspense>
          }
        />
        <Route
          path="menu"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Menu />
            </Suspense>
          }
        />
        <Route
          path="inventory"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Inventory />
            </Suspense>
          }
        />
        <Route
          path="suppliers"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Suppliers />
            </Suspense>
          }
        />
        <Route
          path="customers"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Customers />
            </Suspense>
          }
        />
        <Route
          path="staff"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Staff />
            </Suspense>
          }
        />
        <Route
          path="billing"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Billing />
            </Suspense>
          }
        />
        <Route
          path="finance"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Finance />
            </Suspense>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Reports />
            </Suspense>
          }
        />
        <Route
          path="branches"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Branches />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
