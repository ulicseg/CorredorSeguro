import { Camera, GraduationCap, Shield, Siren, Navigation } from 'lucide-react';

const LEGEND_ITEMS = [
  { id: 'university', label: 'Universidad', color: '#00FFFF', Icon: GraduationCap },
  { id: 'police', label: 'Comisaría', color: '#00FF00', Icon: Shield },
  { id: 'start', label: 'Punto de salida', color: '#f97316', Icon: Navigation },
  { id: 'camera', label: 'Cámara de seguridad', color: '#38bdf8', Icon: Camera },
  { id: 'sos', label: 'Punto SOS', color: '#ef4444', Icon: Siren },
];

export function MapLegend() {
  return (
    <div className="pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-lg backdrop-blur-md">
      <p className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-200/85">Leyenda</p>
      <div className="space-y-2">
        {LEGEND_ITEMS.map(({ id, label, color, Icon }) => (
          <div key={id} className="flex items-center gap-2 text-sm text-slate-200">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ backgroundColor: `${color}26`, color }}
            >
              <Icon size={14} />
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
