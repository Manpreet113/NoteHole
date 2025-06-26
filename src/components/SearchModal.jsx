import { Dialog } from '@headlessui/react';
import { useEffect, useState, useMemo } from 'react';
import useModalStore from '../store/useModalStore';
import useSearchStore from '../store/useSearchStore';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';

export default function SearchModal() {
  const { showSearch, setShowSearch } = useModalStore();
  const { combinedData } = useSearchStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const fuse = useMemo(() => new Fuse(combinedData, {
    keys: ['title', 'content'],
    threshold: 0.3,
    includeScore: true,
  }), [combinedData]);

  useEffect(() => {
    if (!query) {
      setResults([]);
    } else {
      const res = fuse.search(query).map(r => r.item);
      setResults(res);
    }
  }, [query, fuse]);

  const handleNavigate = (item) => {
    setShowSearch(false);
    navigate(`/${item.type}/${item.id}`);
  };

  return (
    <Dialog open={showSearch} onClose={() => setShowSearch(false)} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/40 px-4">
        <Dialog.Panel className="bg-white/10 backdrop-blur-xl dark:bg-black/20 border border-white/20 dark:border-gray-800 p-6 rounded-2xl w-full max-w-xl shadow-xl">
          <Dialog.Title className="text-xl font-semibold mb-4 text-white">
            🔍 Search Anything
          </Dialog.Title>

          <input
            type="text"
            autoFocus
            placeholder="Search tasks, thoughts, ideas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 text-white bg-white/5 border border-white/20 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 mb-4"
          />

          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {results.length === 0 && query !== '' && (
              <p className="text-center text-sm text-gray-400">No results found</p>
            )}

            {results.map((item) => (
              <li
                key={item.id}
                onClick={() => handleNavigate(item)}
                className="p-3 rounded-md cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <div className="text-white font-medium">{item.title}</div>
                <div className="text-sm text-gray-400">{item.type}</div>
              </li>
            ))}
          </ul>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}