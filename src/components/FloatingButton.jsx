// FloatingButton.jsx
// Floating action button for quick actions (bottom right corner)
import React from 'react';
import { motion } from 'framer-motion';
export default function FloatingButton({ onClick, icon = "+", label = "", className = "" }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 btn shadow-xl backdrop-blur-md ${className} w-14 h-14 sm:w-16 sm:h-16 rounded-full text-2xl sm:text-3xl bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white border-purple-300`}
      aria-label={label || icon}
    >
      {icon}
    </motion.button>
  );
}
