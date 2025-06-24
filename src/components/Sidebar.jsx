import { Link, useLocation } from 'react-router-dom';
import {
  Lightbulb,
  BrainCircuit,
  ListChecks,
  Moon,
  Sun,
  User,
  X,
} from 'lucide-react';
import useSidebarStore from '../store/useSidebarStore';
import useDarkModeStore from '../store/useDarkModeStore';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SideBar() {
  const location = useLocation();
  const { isExpanded, collapseSidebar } = useSidebarStore();
  const { isDark, toggleDarkMode } = useDarkModeStore();
  const [isTinyScreen, setIsTinyScreen] = useState(false);

  const links = [
    {
      path: '/thoughts',
      label: 'Thoughts',
      Icon: BrainCircuit,
      activeColor: 'text-purple-800',
    },
    {
      path: '/ideas',
      label: 'Ideas',
      Icon: Lightbulb,
      activeColor: 'text-yellow-600',
    },
    {
      path: '/tasks',
      label: 'Tasks',
      Icon: ListChecks,
      activeColor: 'text-green-600',
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsTinyScreen(window.innerWidth < 400);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col gap-6">
      {links.map(({ path, label, Icon, activeColor }) => (
        <Link to={path} key={path} onClick={isTinyScreen ? collapseSidebar : undefined}>
          <div className="flex items-center gap-3">
            <Icon
              strokeWidth={location.pathname === path ? 3 : 2}
              className={`h-6 w-6 transition-all ${
                location.pathname === path
                  ? `${activeColor} scale-110`
                  : 'text-white'
              }`}
            />
            <span
              className={`text-sm font-medium text-white transition-all ${
                isExpanded ? 'inline-block' : 'hidden group-hover:inline-block'
              }`}
            >
              {label}
            </span>
          </div>
        </Link>
      ))}

      {isTinyScreen && (
  <div className="mt-4 border-t border-white/10 pt-4 space-y-4">
    {/* 🌙 Theme toggle */}
    <button
      onClick={() => toggleDarkMode(!isDark)}
      className="flex items-center gap-3 text-white hover:text-yellow-300 transition"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-purple-400" />
      )}
      <span className="text-sm">Toggle Theme</span>
    </button>

    {/* 👤 Login link */}
    <Link to="/login" onClick={collapseSidebar}>
      <div className="flex items-center gap-3 text-white hover:text-purple-500 transition">
        <User className="w-5 h-5" />
        <span className="text-sm">Login</span>
      </div>
    </Link>
  </div>
)}

    </div>
  );

  return (
    <>
      {/* 🖥️ Desktop Sidebar - Always shown */}
      <div
        className={`
          hidden sm:block fixed top-1/2 left-0 -translate-y-1/2 z-30 
          p-4 bg-black/30 backdrop-blur-lg border border-gray-700 rounded-r-2xl 
          shadow-xl overflow-hidden group transition-all 
          ${isExpanded ? 'w-40' : 'w-16 hover:w-40'}
        `}
      >
        <SidebarContent />
      </div>

      {/* 📱 Mobile Sidebar - Slide in only when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="sidebar-mobile"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="sm:hidden fixed top-0 left-0 h-full w-40 z-50 
              bg-black/90 backdrop-blur-xl p-4 shadow-xl border-r border-gray-700"
          >
            {/* ❌ Close button (top-left) */}
            <button
              onClick={collapseSidebar}
              className="absolute top-3 left-3 p-1 rounded-md hover:bg-purple-700 text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-10">
              <SidebarContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SideBar;
