import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';

export function SOSEmergency() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        aria-label="Activar SOS"
        onClick={() => setIsOpen(true)}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed right-4 top-4 z-[1100] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-red-800 text-white shadow-[0_0_18px_rgba(244,63,94,0.35)] ring-2 ring-rose-400/20 md:h-14 md:w-14"
      >
        <ShieldAlert size={20} strokeWidth={2.2} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-[2rem] border border-rose-400/20 bg-gradient-to-b from-rose-950 via-red-950 to-slate-950 p-6 shadow-[0_40px_100px_rgba(0,0,0,0.65)]"
              initial={{ scale: 0.92, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 16, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/30">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-rose-300/70">Emergencia</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">CONECTANDO CON 911</h2>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Cancelar SOS"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-4 text-sm leading-6 text-rose-100/80">
                Se simuló el envío de alerta crítica y el estado de despacho. Este es un flujo de prueba visual para el MVP.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                <Loader2 className="animate-spin text-rose-300" size={18} />
                <span>Transmitiendo ubicación al centro de respuesta...</span>
              </div>

              <div className="mt-6 rounded-2xl border border-rose-400/15 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
                Mantener presionado el dispositivo no es necesario. Esta acción responde con un solo toque.
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-4 font-semibold text-white transition hover:bg-rose-600"
              >
                <X size={18} />
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
