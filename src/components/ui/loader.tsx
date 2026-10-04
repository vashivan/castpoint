'use client'

import { motion } from 'framer-motion';

export default function CastpointLoader() {
  return (
    <div className="w-full flex items-center justify-center">
      <motion.div
        className="h-6 w-6 border-4 border-ink border-t-lime"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
    </div>
  );
}
