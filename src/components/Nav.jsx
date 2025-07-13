// Nav.jsx
// Top navigation bar: includes hamburger, search, theme toggle, and login link
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useSearchStore from '../store/useSearchStore';
import useSidebarStore from '../store/useSidebarStore';
import useDarkModeStore from '../store/useDarkModeStore';
import { motion } from 'framer-motion';
import { link } from 'framer-motion/m';
import useAuthStore from '../store/useAuthStore';

function Nav() {
  // Global state for theme, search, and sidebar
  const { isDark, toggleDarkMode } = useDarkModeStore();
  const { searchQuery, setSearchQuery } = useSearchStore();
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  // Local state for tiny screens
  const [isTinyScreen, setIsTinyScreen] = useState(false);
  // Dropdown state for avatar menu
  const [showMenu, setShowMenu] = useState(false);

  // Clear search query on route change
  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  // Detect tiny screens for responsive UI
  useEffect(() => {
    const handleResize = () => {
      setIsTinyScreen(window.innerWidth < 400);
    };
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // Navigation bar container
    <motion.nav
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="fixed top-0 left-0 w-full z-40 bg-white/30 dark:bg-black/30 backdrop-blur-md border-b border-white/10 shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sm:justify-start gap-4">

        {/* 🍔 Animated Hamburger → ❌ (mobile only) */}
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-sm sm:hidden"
          aria-label="Toggle sidebar"
        >
          <motion.div
            className="w-6 h-6 relative"
            initial={false}
            animate={isExpanded ? 'open' : 'closed'}
          >
            {/* Hamburger top line */}
            <motion.span
              className="absolute block h-0.5 w-6 bg-white"
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 6 },
              }}
              transition={{ duration: 0.2 }}
            />
            {/* Hamburger middle line */}
            <motion.span
              className="absolute block h-0.5 w-6 bg-white top-1/2 -translate-y-1/2"
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 },
              }}
              transition={{ duration: 0.2 }}
            />
            {/* Hamburger bottom line */}
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

        {/* 🧠  NoteHole Title (hidden on tiny screens) */}
        {!isTinyScreen && (
          <Link to="/" aria-label=' NoteHole Landing Page'><h1
            className="sm:block text-xl sm:text-2xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-secondary)' }}
          >
             NoteHole
          </h1>
          </Link>
        )}

        {/* 🔍 Search bar (with title embedded if on tiny screen) */}
        <div className="flex-1">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800 
                text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 
                border border-gray-300 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 
                focus:ring-purple-500 text-sm sm:text-base`}
              placeholder={
                isTinyScreen
                  ? '🧠  NoteHole | 🔍 Search the dump'
                  : '🔍 Search the dump'
              }
              aria-label="Search the dump"
            />
          </div>
        </div>

        {/* 🌙 Theme toggle + 👤 Avatar/Login (hidden on tiny) */}
        {!isTinyScreen && (
          <div className="flex items-center gap-3 relative">
            {/* Theme toggle button */}
            <motion.button
              whileHover={{ scale: 1.13 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              onClick={() => toggleDarkMode(!isDark)}
              className="btn btn-ghost w-10 h-10 rounded-full hover:bg-purple-600 dark:hover:bg-purple-700"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <i className="ri-sun-line text-xl" />
              ) : (
                <i className="ri-moon-line text-xl" />
              )}
            </motion.button>
            {/* User avatar or login button */}
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  onClick={() => setShowMenu((v) => !v)}
                  className="btn btn-primary w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                  aria-label="User menu"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-lg">
                      {/* User initials or icon */}
                      {user.user_metadata?.full_name
                        ? user.user_metadata.full_name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase()
                        : <i className="ri-user-line" />}
                    </span>
                  )}
                </motion.button>
                {/* Dropdown menu for user actions */}
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800">
                      {user.user_metadata?.full_name || user.email}
                    </div>
                    <button
                      onClick={() => { signOut(); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link to="/login" aria-label="Login">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="btn btn-primary w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                >
                  <i className="ri-user-line" />
                </motion.button>
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
}

export default Nav;