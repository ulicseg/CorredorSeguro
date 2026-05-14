import { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { MapLegend } from './MapLegend';
import { StartPointSelector } from './StartPointSelector';

export function MapToolsPanel({ selectedStartPointId, onSelectStartPoint }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-[900] flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full border border-zinc-700/40 bg-zinc-950 px-3 text-[11px] font-medium text-zinc-300 shadow-lg shadow-zinc-900/15 backdrop-blur-md transition hover:bg-zinc-900"
        aria-expanded={isOpen}
        aria-label="Abrir controles del mapa"
      >
        <SlidersHorizontal size={14} />
        <span>Capas</span>
        <ChevronDown size={14} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="pointer-events-auto flex w-[15rem] max-w-[calc(100vw-1.5rem)] flex-col gap-2 rounded-2xl border border-white/10 bg-zinc-900 p-2 shadow-2xl backdrop-blur-md sm:w-[16rem]">
          <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-200/85">Mapa</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full px-2 py-1 text-[10px] text-slate-300 hover:bg-white/5"
            >
              Cerrar
            </button>
          </div>

          <StartPointSelector
            selectedStartPointId={selectedStartPointId}
            onSelectStartPoint={onSelectStartPoint}
          />

          <MapLegend />
        </div>
      )}
    </div>
  );
}
