import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useSearchStore from '../store/useSearchStore';
import useSidebarStore from '../store/useSidebarStore';
import useDarkModeStore from '../store/useDarkModeStore';

function Nav() {
  const { isDark, toggleDarkMode } = useDarkModeStore();
  const { searchQuery, setSearchQuery } = useSearchStore();
  const { toggleSidebar } = useSidebarStore();
  const location = useLocation();

  const [isTinyScreen, setIsTinyScreen] = useState(false);

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  // 📱 Detect ultra small screens (e.g., < 400px)
  useEffect(() => {
    const handleResize = () => {
      setIsTinyScreen(window.innerWidth < 400);
    };
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-white/30 dark:bg-black/30 backdrop-blur-md border-b border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sm:justify-start gap-4">
        
        {/* ☰ Hamburger */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-purple-500/80 dark:hover:bg-purple-700 transition-colors focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <i className="ri-menu-line text-2xl" />
        </button>

        {/* BrainDump heading — show only if not on tiny screen */}
        {!isTinyScreen && (
          <h1
            className="sm:block text-xl sm:text-2xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-secondary)' }}
          >
            BrainDump
          </h1>
        )}

        {/* 🔍 Search bar */}
        <div className="flex-1">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800 
                text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 
                border border-gray-300 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 
                focus:ring-purple-500 text-sm sm:text-base pl-${isTinyScreen ? '24' : '4'}`}
              placeholder={isTinyScreen ? 'BrainDump | 🔍 Search the dump' : '🔍 Search the dump'}
              aria-label="Search the dump"
            />
          </div>
        </div>

        {/* ☀️/🌙 Dark toggle — show only if not tiny */}
        {!isTinyScreen && (
          <div className="sm:flex hidden items-center gap-3">
            <button
              onClick={() => toggleDarkMode(!isDark)}
              className="p-2 rounded-full hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <i className="ri-sun-line text-xl" />
              ) : (
                <i className="ri-moon-line text-xl" />
              )}
            </button>

            {/* 👤 Login avatar — hidden on tiny screens */}
            <Link to="/login" aria-label="Login">
              <div className="w-9 h-9 bg-purple-600 dark:bg-purple-700 rounded-full flex items-center justify-center text-white hover:bg-purple-800 transition cursor-pointer">
                <i className="ri-user-line" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Nav;
