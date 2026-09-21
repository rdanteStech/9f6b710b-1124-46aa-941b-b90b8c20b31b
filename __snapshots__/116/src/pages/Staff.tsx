const staff = [
  { id: 1, name: 'Ana Martínez', role: 'Mesera', shift: 'Matutino', status: 'Activo', img: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 2, name: 'Luis Ramírez', role: 'Mesero', shift: 'Matutino', status: 'Activo', img: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 3, name: 'María Torres', role: 'Mesera', shift: 'Vespertino', status: 'Activo', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 4, name: 'Roberto Vega', role: 'Chef Ejecutivo', shift: 'Full', status: 'Activo', img: 'https://images.pexels.com/photos/887827/pexels-photo-887827.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 5, name: 'Sofía Herrera', role: 'Sous Chef', shift: 'Matutino', status: 'Activo', img: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 6, name: 'Diego Morales', role: 'Bartender', shift: 'Vespertino', status: 'Descanso', img: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 7, name: 'Carmen Ruiz', role: 'Cajera', shift: 'Matutino', status: 'Activo', img: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 8, name: 'Javier Ortiz', role: 'Ayudante Cocina', shift: 'Vespertino', status: 'Activo', img: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=200' },
];

export default function Staff() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Personal</h1>
        <p className="text-slate-600 mt-1">{staff.length} empleados en total</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {staff.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <img src={s.img} alt={s.name} className="w-14 h-14 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">{s.name}</div>
                <div className="text-sm text-slate-500 truncate">{s.role}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Turno: <span className="font-medium text-slate-900">{s.shift}</span></span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.status === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
