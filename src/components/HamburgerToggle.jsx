// HamburgerToggle.jsx
// Animated hamburger menu button for toggling sidebar (mobile)
import { motion } from 'framer-motion';

function HamburgerToggle({ isOpen, toggle }) {
  return (
    // Hamburger button
    <button
      onClick={toggle}
      className="sm:hidden p-2 z-50 fixed top-3 left-3 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
      aria-label="Toggle sidebar"
    >
      <motion.div
        className="w-6 h-6 relative"
        initial={false}
        animate={isOpen ? "open" : "closed"}
      >
        {/* Top Line */}
        <motion.span
          className="absolute block h-0.5 w-6 bg-white"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: 45, y: 6 },
          }}
          transition={{ duration: 0.2 }}
        />
        {/* Middle Line */}
        <motion.span
          className="absolute block h-0.5 w-6 bg-white top-1/2 -translate-y-1/2"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          transition={{ duration: 0.2 }}
        />
        {/* Bottom Line */}
        <motion.span
          className="absolute block h-0.5 w-6 bg-white bottom-0"
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: -45, y: -6 },
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </button>
  );
}

export default HamburgerToggle;
