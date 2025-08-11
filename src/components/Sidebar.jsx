// Sidebar.jsx: Navigation for major app sections, with theme toggle and login.
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
  const { isExpanded, collapseSidebar, toggleSidebar } = useSidebarStore();
  const { isDark, toggleDarkMode } = useDarkModeStore();

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

  // Sidebar content (links, theme toggle, login).
  const SidebarContent = ({ expanded }) => (
    <nav aria-label="Sidebar Navigation">
      <ul className="flex flex-col gap-4 p-2 sm:gap-6 sm:p-4">
        {links.map(({ path, label, Icon, activeColor }) => (
          <li key={path}>
            <Link to={path} onClick={() => {
              if (window.innerWidth < 640) collapseSidebar();
            }} className={`group flex items-center ${expanded ? 'gap-3 justify-start' : 'gap-0 justify-center'} min-w-0`}>
              <span className="flex-shrink-0">
                <Icon
                  strokeWidth={location.pathname === path ? 3 : 2}
                  className={`h-6 w-6 flex-shrink-0 transition-all ${
                    location.pathname === path
                      ? `${activeColor} scale-110`
                      : 'text-white'
                  }`}
                />
              </span>
              <span
                className={`text-xs sm:text-sm font-medium text-white transition-all duration-200
                  ${expanded ? 'inline-block' : 'hidden group-hover:inline-block'}
                  whitespace-nowrap`}
              >
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="sm:hidden">
        <div className="mt-4 border-t border-white/10 pt-4 space-y-4">
          <button
            onClick={() => toggleDarkMode(!isDark)}
            className="btn btn-ghost btn-sm flex items-center gap-3 text-white hover:text-yellow-300"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-purple-400" />
            )}
            <span className="text-sm">Toggle Theme</span>
          </button>
          <Link to="/login" onClick={collapseSidebar}>
            <div className="btn btn-ghost btn-sm flex items-center gap-3 text-white hover:text-purple-500">
              <User className="w-5 h-5" />
              <span className="text-sm">Login</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );

  const [hovered, setHovered] = useState(false);
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
  const expanded = isDesktop ? (isExpanded || hovered) : isExpanded;

  return (
    <>
      {/* Desktop sidebar (always visible). */}
      <motion.div
        initial={{ width: 60, opacity: 0, x: -20 }}
        animate={{ width: expanded ? 160 : 60, opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className={`
          hidden sm:block fixed top-1/2 left-0 -translate-y-1/2 z-30 
          ${expanded ? 'p-4' : 'py-4 px-2'} bg-black/30 backdrop-blur-lg border border-gray-700 rounded-r-2xl 
          shadow-xl overflow-hidden transition-all
        `}
        style={{ width: expanded ? 160 : 60 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <SidebarContent expanded={expanded} />
      </motion.div>

      {/* Mobile sidebar (slides in). */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="sidebar-mobile"
            initial={{ x: '-100%', opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: '-100%', opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="sm:hidden fixed top-0 left-0 h-full w-40 z-50 
              bg-black/90 backdrop-blur-xl p-4 shadow-xl border-r border-gray-700"
          >
            <button
              onClick={collapseSidebar}
              className="absolute top-3 left-3 p-1 rounded-md hover:bg-purple-700 text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="mt-10"
            >
              <SidebarContent expanded={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SideBar;
