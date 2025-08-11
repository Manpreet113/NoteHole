import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import useAuthStore from '../store/useAuthStore';
import useThoughtsStore from '../store/useThoughtsStore';
import FloatingButton from '../components/FloatingButton';
import Fuse from 'fuse.js';
import { setPageSEO } from '../utils/seo.js';

function Thoughts() {
  const { user, e2eeKey } = useAuthStore();
  const { thoughts, loading, hydrated, fetchThoughts, addThought, editThought, deleteThought } = useThoughtsStore();
  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef(null);
  const { searchQuery, setThoughts: setSearchThoughts } = useSearchStore();


  useEffect(() => {
    if (hydrated && user && e2eeKey) {
      fetchThoughts();
    }
  }, [hydrated, user, e2eeKey, fetchThoughts]);

  useEffect(() => {
    setSearchThoughts(thoughts);
  }, [thoughts, setSearchThoughts]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // SEO for the Thoughts page.
  useEffect(() => {
    setPageSEO({
      title: 'Thoughts – NoteHole',
      description: 'Quickly jot down and organize your fleeting thoughts. Search, edit, and sync your brain dumps with NoteHole.',
      canonical: 'https://notehole.pages.dev/thoughts'
    });
  }, []);

  // Fuzzy search with Fuse.js.
  const fuse = useMemo(() => {
    return new Fuse(thoughts, {
      keys: ['thought'],
      threshold: 0.3,
    });
  }, [thoughts]);

  if (!hydrated) {
    return <div className="text-center text-gray-500 mb-4">Loading...</div>;
  }

  // Adds a new thought.
  const handleAddThought = async () => {
    if (!newThought.trim()) return;
    await addThought(newThought);
    setNewThought('');
  };

  // Saves an edited thought.
  const handleSaveEdit = async (id) => {
    await editThought(id, editText);
    setEditingId(null);
    setEditText('');
  };

  // Filters thoughts based on the search query.
  const filtered =
    searchQuery.trim() === ''
      ? thoughts
      : fuse.search(searchQuery).map((r) => r.item);

  return (
    <div className="min-h-screen text-black dark:text-white flex flex-col text-xs sm:text-base">
      <h1 className="text-4xl font-bold mb-6">Thoughts Dump Zone</h1>
      {loading && <div className="text-center text-gray-500 mb-4">Saving...</div>}
      <form
        onSubmit={e => { e.preventDefault(); handleAddThought(); }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8"
      >
        <input
          type="text"
          placeholder="New thought..."
          value={newThought}
          onChange={e => setNewThought(e.target.value)}
          className="flex-1 px-2 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-base"
          required
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-xs sm:text-base"
          disabled={loading}
        >
          Add
        </button>
      </form>
      <ul className="space-y-2 sm:space-y-4">
        {filtered.map((thought) => (
          <li
            key={thought.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-6 shadow-md flex flex-col gap-1 sm:gap-2"
          >
            {editingId === thought.id ? (
              <div className="flex w-full space-x-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit(thought.id);
                    }
                  }}
                  className="flex-1 p-2 bg-purple-700 text-white rounded"
                  disabled={loading}
                />
                <button
                  onClick={() => handleSaveEdit(thought.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div>
                  {parseText(thought.thought)}
                  <span className="text-gray-400 text-sm">
                    ({new Date(thought.created_at).toLocaleString()})
                  </span>
                </div>
                <div className="space-x-2 flex items-center">
                  <button
                    onClick={() => {
                      setEditingId(thought.id);
                      setEditText(thought.thought);
                    }}
                    className="btn btn-ghost btn-sm text-yellow-400 hover:text-yellow-600"
                    disabled={loading}
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => deleteThought(thought.id)}
                    className="btn btn-ghost btn-sm text-red-400 hover:text-red-600"
                    disabled={loading}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <FloatingButton onClick={handleAddThought} label="Add Thought" icon="+" />
    </div>
  );
}

export default Thoughts;
