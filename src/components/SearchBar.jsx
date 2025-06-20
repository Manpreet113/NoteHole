import { Search } from 'lucide-react';

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white/80 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    </div>
  );
}

export default SearchBar;
