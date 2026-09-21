import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Dashboard from './Dashboard';
import POS from './POS';
import Tables from './Tables';
import Kitchen from './Kitchen';
import Orders from './Orders';
import Reservations from './Reservations';
import Menu from './Menu';
import Inventory from './Inventory';
import Suppliers from './Suppliers';
import Customers from './Customers';
import Staff from './Staff';
import Finance from './Finance';
import Billing from './Billing';
import Reports from './Reports';
import Branches from './Branches';
import Settings from './Settings';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh flex bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="tables" element={<Tables />} />
            <Route path="kitchen" element={<Kitchen />} />
            <Route path="orders" element={<Orders />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="menu" element={<Menu />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="customers" element={<Customers />} />
            <Route path="staff" element={<Staff />} />
            <Route path="finance" element={<Finance />} />
            <Route path="billing" element={<Billing />} />
            <Route path="reports" element={<Reports />} />
            <Route path="branches" element={<Branches />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
