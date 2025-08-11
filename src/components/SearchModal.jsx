// SearchModal.jsx: A modal for searching across all app data.
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import useModalStore from '../store/useModalStore';
import useSearchStore from '../store/useSearchStore';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';

export default function SearchModal() {
  const { showSearch, setShowSearch } = useModalStore();
  const { ideas, tasks, thoughts } = useSearchStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // Combines all data into a single array for searching.
  const combinedData = useMemo(() => {
    const combined = [];
    
    ideas.forEach(idea => {
      combined.push({
        id: idea.id,
        type: 'ideas',
        title: idea.title,
        content: idea.description,
         created_at: idea. created_at,
        originalData: idea
      });
    });

    tasks.forEach(task => {
      combined.push({
        id: task.id,
        type: 'tasks',
        title: task.name,
        content: task.name, // Tasks only have a name.
        is_done: task.is_done,
         created_at: task. created_at,
        originalData: task
      });
    });

    thoughts.forEach(thought => {
      combined.push({
        id: thought.id,
        type: 'thoughts',
        title: thought.thought.substring(0, 50) + (thought.thought.length > 50 ? '...' : ''),
        content: thought.text,
         created_at: thought. created_at,
        originalData: thought
      });
    });

    return combined;
  }, [ideas, tasks, thoughts]);

  // Fuzzy search with Fuse.js.
  const fuse = useMemo(() => new Fuse(combinedData, {
    keys: ['title', 'content'],
    threshold: 0.3,
    includeScore: true,
  }), [combinedData]);

  // Updates results when the query or data changes.
  useEffect(() => {
    if (!query) {
      setResults([]);
    } else {
      const res = fuse.search(query).map(r => r.item);
      setResults(res);
    }
  }, [query, fuse]);

  // Groups results by type (ideas, tasks, thoughts).
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

  // Navigates to the selected item's page.
  const handleNavigate = (item) => {
    setShowSearch(false);
    navigate(`/${item.type}`);
  };

  // Gets the title and icon for each section.
  const getSectionInfo = (type) => {
    switch (type) {
      case 'ideas': return { title: '\ud83d\udca1 Ideas', count: groupedResults.ideas.length };
      case 'tasks': return { title: '\ud83d\udcdd Tasks', count: groupedResults.tasks.length };
      case 'thoughts': return { title: '\ud83e\udde0 Thoughts', count: groupedResults.thoughts.length };
      default: return { title: 'Unknown', count: 0 };
    }
  };

  return (
    <AnimatePresence>
      {showSearch && (
        <Dialog open={showSearch} onClose={() => setShowSearch(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen bg-black/40 px-2 sm:px-4">
            <Dialog.Panel as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-white/10 backdrop-blur-xl dark:bg-black/20 border border-white/20 dark:border-gray-800 p-3 sm:p-6 rounded-2xl w-full max-w-xs sm:max-w-2xl shadow-xl"
            >
              <Dialog.Title className="text-lg sm:text-xl font-semibold mb-4 text-white">
                 Search Anything
              </Dialog.Title>
              <input
                type="text"
                autoFocus
                placeholder="Search tasks, thoughts, ideas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 sm:p-3 text-base sm:text-lg text-white bg-white/5 border border-white/20 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 mb-4"
              />
              <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                {results.length === 0 && query !== '' && (
                  <p className="text-center text-sm text-gray-400 py-4">No results found</p>
                )}
                {query === '' && (
                  <p className="text-center text-sm text-gray-400 py-4">Start typing to search...</p>
                )}
                {Object.entries(groupedResults).map(([type, items]) => {
                  if (items.length === 0) return null;
                  const sectionInfo = getSectionInfo(type);
                  return (
                    <div key={type} className="mb-6">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                        <h3 className="text-white font-semibold text-xs sm:text-sm">
                          {sectionInfo.title}
                        </h3>
                        <span className="text-xs text-gray-400 bg-white/10 px-1.5 py-0.5 rounded-full">
                          {sectionInfo.count}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNavigate(item)}
                            className="p-3 rounded-md cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                          >
                            <div className="text-white font-medium text-xs sm:text-sm mb-1">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-400 line-clamp-2">
                              {item.content}
                            </div>
                            {item.is_done !== undefined && (
                              <div className="text-xs text-gray-500 mt-1">
                                {item.is_done ? '\u2705 Completed' : '\u23f3 Pending'}
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
      )}
    </AnimatePresence>
  );
}