'use client'

import { motion } from 'framer-motion';

export default function CastpointLoader() {
  return (
    <div className="w-full flex items-center justify-center">
      <motion.div
        className="w-6 h-6 border-4 border-white/70 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
    </div>
  );
}
