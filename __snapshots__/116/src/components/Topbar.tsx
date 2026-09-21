import { Menu, Bell, Search } from 'lucide-react';

type Props = { onMenuClick: () => void };

export default function Topbar({ onMenuClick }: Props) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-20 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg cursor-pointer"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar orden, cliente, plato..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative p-2 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
          CG
        </div>
      </div>
    </header>
  );
}
