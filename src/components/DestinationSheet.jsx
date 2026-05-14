import { motion } from 'framer-motion';
import { MapPin, Route } from 'lucide-react';
import { SECURITY_POINTS } from '../mocks/securityPoints';

const DESTINATIONS = SECURITY_POINTS
  .filter((point) => point.type === 'university')
  .map((point) => ({
    ...point,
    name: `Ir a ${point.name}`,
    subtitle: point.id === 'utn'
      ? 'Ruta prioritaria al campus tecnológico'
      : 'Ruta directa al campus universitario',
  }));

export function DestinationSheet({ isOpen, onSelectDestination, onClose }) {
  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-[1000] px-4 pb-4"
      initial={false}
      animate={{ y: isOpen ? 0 : 260, opacity: isOpen ? 1 : 0.98 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
    >
      <div className="mx-auto max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="px-5 pt-4">
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/20" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Corredor seguro</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Elegí tu destino</h2>
              <p className="mt-1 text-sm text-slate-400">OSRM trazará una ruta real por las calles de Resistencia.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5">
          {DESTINATIONS.map((destination) => (
            <motion.button
              key={destination.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectDestination(destination)}
              className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/20">
                <Route size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-white">{destination.name}</span>
                <span className="mt-1 block text-sm text-slate-400">{destination.subtitle}</span>
              </span>
              <MapPin size={18} className="text-cyan-300 transition group-hover:translate-x-0.5" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
