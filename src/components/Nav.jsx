// Nav.jsx: Top navigation bar with search, theme toggle, and login.
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useSearchStore from '../store/useSearchStore';
import useSidebarStore from '../store/useSidebarStore';
import useDarkModeStore from '../store/useDarkModeStore';
import { motion } from 'framer-motion';
import { link } from 'framer-motion/m';
import useAuthStore from '../store/useAuthStore';
import Fuse from 'fuse.js';

function Nav() {
  const { isDark, toggleDarkMode } = useDarkModeStore();
  const { searchQuery, setSearchQuery, ideas, tasks, thoughts } = useSearchStore();
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const [isTinyScreen, setIsTinyScreen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Clears the search query when the page changes.
  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  // Hides the title on small screens.
  useEffect(() => {
    const handleResize = () => {
      setIsTinyScreen(window.innerWidth < 400);
    };
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fuzzy search for the nav bar.
  const [navResults, setNavResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const combinedData = [
    ...ideas.map(idea => ({
      id: idea.id,
      type: 'ideas',
      title: idea.title,
      content: idea.description,
      originalData: idea
    })),
    ...tasks.map(task => ({
      id: task.id,
      type: 'tasks',
      title: task.name,
      content: task.name,
      is_done: task.is_done,
      originalData: task
    })),
    ...thoughts.map(thought => ({
      id: thought.id,
      type: 'thoughts',
      title: thought.thought.substring(0, 50) + (thought.thought.length > 50 ? '...' : ''),
      content: thought.text,
      originalData: thought
    }))
  ];
  const fuse = new Fuse(combinedData, {
    keys: ['title', 'content'],
    threshold: 0.3,
    includeScore: true,
  });
  useEffect(() => {
    if (!searchQuery) {
      setNavResults([]);
      setShowDropdown(false);
    } else {
      const res = fuse.search(searchQuery).map(r => r.item);
      setNavResults(res);
      setShowDropdown(res.length > 0);
    }
  }, [searchQuery, ideas, tasks, thoughts]);
  // Groups results by type.
  const groupedNavResults = {
    ideas: [],
    tasks: [],
    thoughts: []
  };
  navResults.forEach(item => {
    if (groupedNavResults[item.type]) {
      groupedNavResults[item.type].push(item);
    }
  });

  return (
    <motion.nav
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="fixed top-0 left-0 w-full z-40 bg-white/30 dark:bg-black/30 backdrop-blur-md border-b border-white/10 shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sm:justify-start gap-4">

        {/* Animated hamburger menu for mobile. */}
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
            <motion.span
              className="absolute block h-0.5 w-6 bg-white"
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 6 },
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="absolute block h-0.5 w-6 bg-white top-1/2 -translate-y-1/2"
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 },
              }}
              transition={{ duration: 0.2 }}
            />
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

        {!isTinyScreen && (
          <Link to="/" aria-label=' NoteHole Landing Page'><h1
            className="sm:block text-xl sm:text-2xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-secondary)' }}
          >
             NoteHole
          </h1>
          </Link>
        )}

        <div className="flex-1">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(navResults.length > 0 && searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
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
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {navResults.length === 0 && searchQuery !== '' && (
                  <p className="text-center text-sm text-gray-400 py-4">No results found</p>
                )}
                {Object.entries(groupedNavResults).map(([type, items]) => {
                  if (items.length === 0) return null;
                  const sectionTitle = type === 'ideas' ? '💡 Ideas' : type === 'tasks' ? '📝 Tasks' : '🧠 Thoughts';
                  return (
                    <div key={type} className="mb-2">
                      <div className="flex items-center justify-between mb-1 px-3 pt-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{sectionTitle}</span>
                        <span className="text-xs text-gray-400">{items.length}</span>
                      </div>
                      <div className="space-y-1">
                        {items.map(item => (
                          <div
                            key={item.id}
                            onMouseDown={() => {
                              setShowDropdown(false);
                              setSearchQuery('');
                              navigate(`/${item.type}`);
                            }}
                            className="px-3 py-2 cursor-pointer rounded-md hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-colors"
                          >
                            <div className="text-xs font-medium text-gray-900 dark:text-white">{item.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-300 line-clamp-1">{item.content}</div>
                            {item.is_done !== undefined && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {item.is_done ? '✅ Completed' : '⏳ Pending'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {!isTinyScreen && (
          <div className="flex items-center gap-3 relative">
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
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  onClick={() => setShowMenu((v) => !v)}
                  className="btn btn-ghost w-10 h-10 p-0 rounded-full hover:bg-purple-600 dark:hover:bg-purple-700"
                  aria-label="Open user menu"
                >
                  <div className="avatar">
                    <div className={`w-9 rounded-full bg-neutral text-neutral-content${user.user_metadata?.avatar_url ? '' : ' avatar-placeholder'}`}> 
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="avatar"
                          className="object-cover w-9 h-9"
                        />
                      ) : (
                        <span className="font-bold text-lg">
                          {user.user_metadata?.full_name
                            ? user.user_metadata.full_name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase()
                            : <i className="ri-user-line" />}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
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