import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export function SOSEmergency() {
  return (
    <motion.a
      href="tel:911"
      aria-label="Llamar al 911"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      className="fixed right-4 top-4 z-[1100] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-red-800 text-white shadow-[0_0_18px_rgba(244,63,94,0.35)] ring-2 ring-rose-400/20 md:h-14 md:w-14 hover:from-rose-600 hover:to-red-900 transition-colors"
    >
      <ShieldAlert size={20} strokeWidth={2.2} />
    </motion.a>
  );
}

