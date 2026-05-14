import { Navigation } from 'lucide-react';
import { START_POINTS } from '../mocks/securityPoints';

export function StartPointSelector({ selectedStartPointId, onSelectStartPoint }) {
  return (
    <div className="pointer-events-auto rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-lg backdrop-blur-md">
      <p className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-orange-200/80">Punto de salida</p>
      <div className="flex flex-col gap-1.5">
        {START_POINTS.map((startPoint) => {
          const isActive = selectedStartPointId === startPoint.id;

          return (
            <button
              key={startPoint.id}
              type="button"
              onClick={() => onSelectStartPoint(startPoint)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.25 text-left text-[10px] transition ${
                isActive
                  ? 'bg-orange-400/20 text-orange-100 ring-1 ring-orange-300/40'
                  : 'bg-white/5 text-zinc-200 hover:bg-white/10'
              }`}
            >
              <Navigation size={13} />
              <span>{startPoint.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
