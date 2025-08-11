import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Info, Pencil, Trash2 } from 'lucide-react';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import useAuthStore from '../store/useAuthStore';
import useThoughtsStore from '../store/useThoughtsStore';
import FloatingButton from '../components/FloatingButton';
import Fuse from 'fuse.js';
import { setPageSEO } from '../utils/seo.js';

function Thoughts() {
  // All hooks at the top
  const { user, loading: authLoading, e2eeKey } = useAuthStore();
  const userId = user?.id;
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

  // Set SEO for Thoughts page
  useEffect(() => {
    setPageSEO({
      title: 'Thoughts – NoteHole',
      description: 'Quickly jot down and organize your fleeting thoughts. Search, edit, and sync your brain dumps with NoteHole.',
      canonical: 'https://notehole.pages.dev/thoughts'
    });
  }, []);

  // Memoized Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(thoughts, {
      keys: ['thought'],
      threshold: 0.3,
    });
  }, [thoughts]);

  // Only render after all hooks
  if (!hydrated) {
    return <div className="text-center text-gray-500 mb-4">Loading...</div>;
  }

  // Add a new thought
  const handleAddThought = async () => {
    if (!newThought.trim()) return;
    await addThought(newThought);
    setNewThought('');
  };

  // Save edits to a thought
  const handleSaveEdit = async (id) => {
    await editThought(id, editText);
    setEditingId(null);
    setEditText('');
  };

  // Filtered thoughts based on search query
  const filtered =
    searchQuery.trim() === ''
      ? thoughts
      : fuse.search(searchQuery).map((r) => r.item);

  return (
    <div className="min-h-screen text-black dark:text-white flex flex-col text-xs sm:text-base">
      <h1 className="text-4xl font-bold mb-6">Thoughts Dump Zone</h1>
      {/* Show loading or saving state */}
      {loading && <div className="text-center text-gray-500 mb-4">Saving...</div>}
      {/* New thought input */}
      <form
        onSubmit={e => { e.preventDefault(); handleAddThought(); }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8"
      >
        <div className="flex flex-col-reverse w-full gap-2 mb-2">
          <label className="flex sm:items-center text-xs gap-1" htmlFor="thought">
            <Info className="w-3 h-3 pt-0.5 sm:pt-0"/>            
            <span className="text-wrap">
              You can use Markdown for formatting (<em>italic</em>, <strong>bold</strong>, <code className="bg-gray-800 px-1 py-0.5 rounded-md">code</code>)
            </span>
          </label>
          <input
            id="thought"
            name="thought"
            type="text"
            placeholder="New thought..."
            value={newThought}
            onChange={e => setNewThought(e.target.value)}
            className="flex-1 px-2 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-base"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-purple-600 self-start text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-xs sm:text-base"
          disabled={loading}
        >
          Add
        </button>
      </form>
      {/* Thoughts list */}
      <ul className="space-y-2 sm:space-y-4">
        {filtered.map((thought) => (
          <motion.li
            key={thought.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-6 shadow-md flex flex-col gap-1 sm:gap-2"
          >
            {editingId === thought.id ? (
              <div className="flex w-full space-x-2">
                {/* Edit input for thought */}
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
                {/* Render parsed thought text with links and timestamp */}
                <span>
                  {parseText(thought.thought)}{' '}
                  <span className="text-gray-400 text-sm">
                    ({new Date(thought.created_at).toLocaleString()})
                  </span>
                </span>
                <div className="space-x-2 flex items-center">
                  {/* Edit button */}
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
                  {/* Delete button */}
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
          </motion.li>
        ))}
      </ul>
      {/* Floating add button */}
      <FloatingButton onClick={handleAddThought} label="Add Thought" icon="+" />
    </div>
  );
}

export default Thoughts;
