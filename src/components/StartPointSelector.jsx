import { Navigation } from 'lucide-react';
import { START_POINTS } from '../mocks/securityPoints';

export function StartPointSelector({ selectedStartPointId, onSelectStartPoint }) {
  return (
    <div className="pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-lg backdrop-blur-md">
      <p className="mb-2 text-xs uppercase tracking-[0.22em] text-orange-200/80">Punto de salida</p>
      <div className="flex flex-col gap-2">
        {START_POINTS.map((startPoint) => {
          const isActive = selectedStartPointId === startPoint.id;

          return (
            <button
              key={startPoint.id}
              type="button"
              onClick={() => onSelectStartPoint(startPoint)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                isActive
                  ? 'bg-orange-400/20 text-orange-100 ring-1 ring-orange-300/40'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Navigation size={15} />
              <span>{startPoint.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
