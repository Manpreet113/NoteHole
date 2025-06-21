import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useSearchStore from '../store/useSearchStore';
import useSidebarStore from '../store/useSidebarStore';

function Nav() {
  const { searchQuery, setSearchQuery } = useSearchStore();
  const location = useLocation();

  // State to control sidebar expansion
  const { toggleSidebar } = useSidebarStore();


  // Reset search on route change
  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 w-full z-40">
      <div className="flex items-center justify-between px-6 py-3 w-full backdrop-blur-md bg-white/20 dark:bg-black/30 border-b border-white/10 shadow-xl">
        {/* Hamburger to toggle sidebar */}
        <button
        onClick={toggleSidebar}
        className="p-2 rounded hover:bg-purple-500 transition-colors"
      >
        <i className="ri-menu-line text-2xl" />
        </button>

        {/* Global search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 mx-6 px-4 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Search the dump"
        />

        {/* Placeholder for future auth logic */}
        <Link to="/login">
          <div className="w-9 h-9 bg-purple-600 dark:bg-purple-700 rounded-full flex items-center justify-center text-white text-sm hover:bg-purple-800 cursor-pointer transition">
            <i className="ri-user-line"></i>
          </div>
        </Link>
      </div>
    </nav>
  );
}

export default Nav;
