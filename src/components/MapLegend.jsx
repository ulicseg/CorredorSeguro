const LEGEND_ITEMS = [
  { id: 'university', label: 'Universidad', color: '#64748b', text: 'U' },
  { id: 'police', label: 'Comisaría', color: '#00FF00', text: 'P' },
  { id: 'start', label: 'Salida', color: '#f97316', text: 'S' },
  { id: 'camera', label: 'Cámara', color: '#64748b', text: 'C' },
  { id: 'sos', label: 'SOS', color: '#ef4444', text: 'SOS' },
];

export function MapLegend() {
  return (
    <div className="pointer-events-auto rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-lg backdrop-blur-md">
      <p className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-zinc-200/85">Leyenda</p>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {LEGEND_ITEMS.map(({ id, label, color, text }) => (
          <div key={id} className="flex items-center gap-1.5 text-[10px] text-zinc-200">
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[7px] font-bold leading-none text-white"
              style={{ backgroundColor: color }}
            >
              {text}
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
