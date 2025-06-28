// SearchModal.jsx
// Modal component for searching across all app data using fuzzy search (Fuse.js)
import { Dialog } from '@headlessui/react';
import { useEffect, useState, useMemo } from 'react';
import useModalStore from '../store/useModalStore';
import useSearchStore from '../store/useSearchStore';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';

export default function SearchModal() {
  // Modal visibility state from global store
  const { showSearch, setShowSearch } = useModalStore();
  // Get data from global store
  const { ideas, tasks, thoughts } = useSearchStore();
  // Local state for search query and results
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // Memoized combined data for search
  const combinedData = useMemo(() => {
    const combined = [];
    
    // Add ideas with type and searchable fields
    ideas.forEach(idea => {
      combined.push({
        id: idea.id,
        type: 'ideas',
        title: idea.title,
        content: idea.description,
        createdAt: idea.createdAt,
        originalData: idea
      });
    });

    // Add tasks with type and searchable fields
    tasks.forEach(task => {
      combined.push({
        id: task.id,
        type: 'tasks',
        title: task.name,
        content: task.name, // Tasks only have name field
        completed: task.completed,
        createdAt: task.createdAt,
        originalData: task
      });
    });

    // Add thoughts with type and searchable fields
    thoughts.forEach(thought => {
      combined.push({
        id: thought.id,
        type: 'thoughts',
        title: thought.text.substring(0, 50) + (thought.text.length > 50 ? '...' : ''),
        content: thought.text,
        createdAt: thought.createdAt,
        originalData: thought
      });
    });

    return combined;
  }, [ideas, tasks, thoughts]);

  // Memoized Fuse.js instance for fuzzy searching
  const fuse = useMemo(() => new Fuse(combinedData, {
    keys: ['title', 'content'],
    threshold: 0.3,
    includeScore: true,
  }), [combinedData]);

  // Update results when query or data changes
  useEffect(() => {
    if (!query) {
      setResults([]);
    } else {
      const res = fuse.search(query).map(r => r.item);
      setResults(res);
    }
  }, [query, fuse]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups = {
      ideas: [],
      tasks: [],
      thoughts: []
    };
    
    results.forEach(item => {
      if (groups[item.type]) {
        groups[item.type].push(item);
      }
    });

    return groups;
  }, [results]);

  // Navigate to the selected item's page and close modal
  const handleNavigate = (item) => {
    setShowSearch(false);
    // Navigate to the appropriate page (the item will be highlighted by search query)
    navigate(`/${item.type}`);
  };

  // Get section title and icon
  const getSectionInfo = (type) => {
    switch (type) {
      case 'ideas': return { title: '💡 Ideas', count: groupedResults.ideas.length };
      case 'tasks': return { title: '📝 Tasks', count: groupedResults.tasks.length };
      case 'thoughts': return { title: '🧠 Thoughts', count: groupedResults.thoughts.length };
      default: return { title: 'Unknown', count: 0 };
    }
  };

  return (
    // Modal dialog for search
    <Dialog open={showSearch} onClose={() => setShowSearch(false)} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/40 px-4">
        <Dialog.Panel className="bg-white/10 backdrop-blur-xl dark:bg-black/20 border border-white/20 dark:border-gray-800 p-6 rounded-2xl w-full max-w-2xl shadow-xl">
          <Dialog.Title className="text-xl font-semibold mb-4 text-white">
            {/* Modal title */}
            🔍 Search Anything
          </Dialog.Title>

          {/* Search input */}
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, thoughts, ideas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 text-white bg-white/5 border border-white/20 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 mb-4"
          />

          {/* Search results with sections */}
          <div className="max-h-96 overflow-y-auto">
            {/* No results message */}
            {results.length === 0 && query !== '' && (
              <p className="text-center text-sm text-gray-400 py-4">No results found</p>
            )}

            {/* No query message */}
            {query === '' && (
              <p className="text-center text-sm text-gray-400 py-4">Start typing to search...</p>
            )}

            {/* Render results grouped by type */}
            {Object.entries(groupedResults).map(([type, items]) => {
              if (items.length === 0) return null;
              
              const sectionInfo = getSectionInfo(type);
              
              return (
                <div key={type} className="mb-6">
                  {/* Section header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                    <h3 className="text-white font-semibold text-sm">
                      {sectionInfo.title}
                    </h3>
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                      {sectionInfo.count}
                    </span>
                  </div>

                  {/* Section items */}
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNavigate(item)}
                        className="p-3 rounded-md cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <div className="text-white font-medium text-sm mb-1">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-2">
                          {item.content}
                        </div>
                        {item.completed !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.completed ? '✅ Completed' : '⏳ Pending'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}