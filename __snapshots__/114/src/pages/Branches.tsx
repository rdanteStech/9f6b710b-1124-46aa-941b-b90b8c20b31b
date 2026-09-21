import { MapPin, Users, TrendingUp } from 'lucide-react';

const branches = [
  { id: 1, name: 'Savora Polanco', address: 'Av. Presidente Masaryk 123, CDMX', staff: 28, sales: 145000, img: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 2, name: 'Savora Roma Norte', address: 'Colima 234, Roma Norte, CDMX', staff: 22, sales: 118000, img: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 3, name: 'Savora Guadalajara', address: 'Av. Chapultepec 456, GDL', staff: 25, sales: 132000, img: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 4, name: 'Savora Monterrey', address: 'Calzada del Valle 789, MTY', staff: 20, sales: 98000, img: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export default function Branches() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Sucursales</h1>
        <p className="text-slate-600 mt-1">{branches.length} sucursales activas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="aspect-video relative overflow-hidden">
              <img src={b.img} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-bold">{b.name}</h3>
                <div className="flex items-center gap-1 text-sm text-white/80 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {b.address}
                </div>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Personal</div>
                  <div className="font-semibold text-slate-900 tabular-nums">{b.staff}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Ventas mes</div>
                  <div className="font-semibold text-slate-900 tabular-nums">${(b.sales / 1000).toFixed(0)}K</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
