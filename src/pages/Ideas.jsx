import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import useAuthStore from '../store/useAuthStore';
import useIdeasStore from '../store/useIdeasStore';
import FloatingButton from '../components/FloatingButton';
import Fuse from 'fuse.js';
import { Pencil, Trash2 } from 'lucide-react';
import { setPageSEO } from '../utils/seo.js';

function Ideas() {
  const { user, e2eeKey } = useAuthStore();
  const { ideas, loading, hydrated, fetchIdeas, addIdea, editIdea, deleteIdea } = useIdeasStore();
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const editTitleRef = useRef(null);
  const { searchQuery, setIdeas: setSearchIdeas } = useSearchStore();

  useEffect(() => {
    if (hydrated && user && e2eeKey) {
      fetchIdeas();
    }
  }, [hydrated, user, e2eeKey, fetchIdeas]);

  useEffect(() => {
    setSearchIdeas(ideas);
  }, [ideas, setSearchIdeas]);

  useEffect(() => {
    if (editingId && editTitleRef.current) {
      editTitleRef.current.focus();
    }
  }, [editingId]);

  // Adds a new idea.
  const handleAddIdea = async () => {
    if (!newTitle.trim()) return;
    await addIdea(newTitle, newDesc);
    setNewTitle('');
    setNewDesc('');
  };

  // Saves an edited idea.
  const handleSaveEdit = async (id) => {
    await editIdea(id, editTitle, editDesc);
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  // Focuses the edit input when an idea is being edited.
  useEffect(() => {
    if (editingId && editTitleRef.current) {
      editTitleRef.current.focus();
    }
  }, [editingId]);

  // SEO for the Ideas page.
  useEffect(() => {
    setPageSEO({
      title: 'Ideas – NoteHole',
      description: 'Capture, organize, and develop your creative ideas. Visual grid, search, and cross-linking for your next big thing.',
      canonical: 'https://notehole.pages.dev/ideas'
    });
  }, []);

  // Fuzzy search with Fuse.js.
  const fuse = useMemo(() => {
    return new Fuse(ideas, {
      keys: ['title', 'description'],
      threshold: 0.3,
    });
  }, [ideas]);

  if (!hydrated) {
    return <div className="text-center text-gray-500 mb-4">Loading...</div>;
  }
  
  // Filters ideas based on the search query.
  const filtered =
    searchQuery.trim() === ''
      ? ideas
      : fuse.search(searchQuery).map((r) => r.item);

  return (
    <div className="min-h-screen text-black dark:text-white flex flex-col text-xs sm:text-base">
      <h1 className="text-4xl font-bold mb-6">Ideas Board</h1>
      {loading && <div className="text-center text-gray-500 mb-4">Saving...</div>}
<main className="flex-1 w-full max-w-xs sm:max-w-3xl lg:max-w-6xl mx-auto px-2 sm:px-6 py-6 sm:py-10">
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleAddIdea();
    }}
    className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8"
  >
    <input
      type="text"
      value={newTitle}
      onChange={(e) => setNewTitle(e.target.value)}
      placeholder="New idea title..."
      className="flex-1 px-2 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-base"
      disabled={loading}
      required
    />
    <input
      type="text"
      value={newDesc}
      onChange={(e) => setNewDesc(e.target.value)}
      placeholder="Description (optional)"
      className="flex-1 px-2 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-base"
      disabled={loading}
    />
    <button
      type="submit"
      className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-xs sm:text-base"
      disabled={loading}
    >
      Add
    </button>
  </form>

  <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 space-y-4 mt-6">
    {filtered.map((idea) => (
      <div
        key={idea.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="break-inside-avoid mb-4 p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-purple-300/10 rounded-lg shadow-md hover:scale-[1.02] hover:shadow-2xl transition duration-300 cursor-pointer"
      >
        {editingId === idea.id ? (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <input
              ref={editTitleRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit(idea.id);
                }
              }}
              className="w-full p-2 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 text-black dark:text-white rounded"
              disabled={loading}
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleSaveEdit(idea.id);
                }
              }}
              className="w-full p-2 bg-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 text-black dark:text-white rounded"
              rows="3"
              disabled={loading}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleSaveEdit(idea.id)}
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
          </div>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-2 break-words break-all whitespace-pre-wrap">
              {idea.title}
            </h2>
            <div className="text-gray-700 dark:text-gray-300 break-words break-all whitespace-pre-wrap overflow-hidden">
              {parseText(idea.description)}
            </div>
            <p className="text-gray-500 text-sm mt-2">
              {new Date(idea.created_at).toLocaleString()}
            </p>
            <div className="mt-2 flex space-x-2 items-center">
              <button
                onClick={() => {
                  setEditingId(idea.id);
                  setEditTitle(idea.title);
                  setEditDesc(idea.description);
                }}
                className="btn btn-ghost btn-sm text-yellow-500 hover:text-yellow-700"
                disabled={loading}
                title="Edit"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => deleteIdea(idea.id)}
                className="btn btn-ghost btn-sm text-red-400 hover:text-red-600"
                disabled={loading}
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
</main>
      <FloatingButton onClick={handleAddIdea} icon="+" label="Add Idea" />
    </div>
  );
}

export default Ideas;