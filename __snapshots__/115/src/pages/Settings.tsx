import { Bell, Lock, User, Palette, Globe, CreditCard } from 'lucide-react';

const sections = [
  { icon: User, title: 'Perfil', desc: 'Información personal y preferencias de cuenta' },
  { icon: Bell, title: 'Notificaciones', desc: 'Configura alertas y recordatorios' },
  { icon: Lock, title: 'Seguridad', desc: 'Contraseña y autenticación de dos factores' },
  { icon: Palette, title: 'Apariencia', desc: 'Tema, colores y personalización visual' },
  { icon: Globe, title: 'Idioma y región', desc: 'Español (MX) · Zona horaria CDMX' },
  { icon: CreditCard, title: 'Facturación', desc: 'Plan actual y métodos de pago' },
];

export default function Settings() {
  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-600 mt-1">Gestiona las preferencias de tu cuenta y del restaurante</p>
      </div>

      <div className="space-y-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              className="w-full bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition-all text-left cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                <Icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{s.title}</div>
                <div className="text-sm text-slate-500 mt-0.5">{s.desc}</div>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
