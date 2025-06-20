import { useSearch } from '../context/SearchContext';
import SearchBar from './SearchBar';
import { Menu, X, UserCircle } from 'lucide-react';

function Nav({ onToggleSidebar, isSidebarLocked }) {
  const { searchQuery, setSearchQuery } = useSearch(); // 🔥 new

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-30 w-5/6">
      <div className="flex items-center justify-between bg-white/60 backdrop-blur-md rounded-full px-4 py-3 shadow-lg border">
        <button
          onClick={onToggleSidebar}
          className="text-black hover:text-blue-500 transition-colors"
        >
          {isSidebarLocked ? <X size={24} /> : <Menu size={24} />}
        </button>

        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for dumps"
        />

        <div className="cursor-pointer">
          <UserCircle size={28} className="text-gray-700 hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </nav>
  );
}

export default Nav;