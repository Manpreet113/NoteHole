// Ideas.jsx
// Ideas board page: create, edit, delete, and search ideas (Supabase sync for logged-in users, localStorage for guests)
import { useState, useEffect, useMemo, useRef } from 'react';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import useAuthStore from '../store/useAuthStore';
import useIdeasStore from '../store/useIdeasStore';
import { supabase } from '../components/supabaseClient';
import FloatingButton from '../components/FloatingButton';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';
import { encryptData, decryptData } from '../utils/e2ee';
import { Pencil, Trash2 } from 'lucide-react';

// Supabase helpers
async function fetchIdeas(userId) {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function addIdeaToSupabase(idea, userId) {
  const { data, error } = await supabase
    .from('ideas')
    .insert([{ ...idea, user_id: userId }])
    .select();
  if (error) throw error;
  return data[0];
}

async function updateIdeaInSupabase(idea, userId) {
  const { data, error } = await supabase
    .from('ideas')
    .update({ title: idea.title, description: idea.description })
    .eq('id', idea.id)
    .eq('user_id', userId)
    .select();
  if (error) throw error;
  return data[0];
}

async function deleteIdeaFromSupabase(id, userId) {
  const { error } = await supabase
    .from('ideas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// --- Offline sync hook ---
function useIdeaSync(userId, addIdeaToSupabase, setIdeas) {
  useEffect(() => {
    function getUnsyncedIdeas() {
      const saved = localStorage.getItem('ideas');
      if (!saved) return [];
      try {
        const arr = JSON.parse(saved);
        return Array.isArray(arr) ? arr.filter((n) => n.synced === false) : [];
      } catch {
        return [];
      }
    }
    function removeSyncedIdeas(syncedIds) {
      const saved = localStorage.getItem('ideas');
      if (!saved) return;
      try {
        const arr = JSON.parse(saved);
        const filtered = arr.filter((n) => !syncedIds.includes(n.id));
        localStorage.setItem('ideas', JSON.stringify(filtered));
      } catch {}
    }
    async function syncIdeas() {
      if (!userId || !navigator.onLine) return;
      const unsynced = getUnsyncedIdeas();
      if (!unsynced.length) return;
      const syncedIds = [];
      for (const idea of unsynced) {
        try {
          const { synced, ...toSave } = idea;
          const saved = await addIdeaToSupabase(toSave, userId);
          setIdeas((prev) => [saved, ...prev.filter((n) => n.id !== idea.id)]);
          syncedIds.push(idea.id);
        } catch (e) {}
      }
      if (syncedIds.length) removeSyncedIdeas(syncedIds);
    }
    if (userId && navigator.onLine) {
      syncIdeas();
    }
    function handleOnline() {
      if (userId) syncIdeas();
    }
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [userId, addIdeaToSupabase, setIdeas]);
}

function Ideas() {
  // All hooks at the top
  const { user, loading: authLoading, e2eeKey } = useAuthStore();
  const userId = user?.id;
  const { ideas, loading, dataReady, fetchIdeas, addIdea, editIdea, deleteIdea, reset } = useIdeasStore();
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const editTitleRef = useRef(null);
  const { searchQuery, setIdeas: setSearchIdeas } = useSearchStore();

  useEffect(() => {
    if (authLoading) return;
    if (userId && !e2eeKey) return;
    if (userId && e2eeKey) {
      fetchIdeas();
    } else {
      reset();
    }
  }, [userId, e2eeKey, authLoading, fetchIdeas, reset]);

  useEffect(() => {
    setSearchIdeas(ideas);
  }, [ideas, setSearchIdeas]);

  useEffect(() => {
    if (editingId && editTitleRef.current) {
      editTitleRef.current.focus();
    }
  }, [editingId]);

  const fuse = useMemo(() => {
    return new Fuse(ideas, {
      keys: ['title', 'description'],
      threshold: 0.3,
    });
  }, [ideas]);

  // Only render after all hooks
  if (authLoading || (userId && !e2eeKey) || !dataReady) {
    return <div className="text-center text-gray-500 mb-4">Loading...</div>;
  }

  // Add a new idea
  const handleAddIdea = async () => {
    if (!newTitle.trim()) return;
    await addIdea(newTitle, newDesc);
    setNewTitle('');
    setNewDesc('');
  };

  // Save edits to an idea
  const handleSaveEdit = async (id) => {
    await editIdea(id, editTitle, editDesc);
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  // Filtered ideas based on search query
  const filtered =
    searchQuery.trim() === ''
      ? ideas
      : fuse.search(searchQuery).map((r) => r.item);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Ideas Board</h1>
      {/* Show loading or saving state */}
      {loading && <div className="text-center text-gray-500 mb-4">Saving...</div>}
      {/* New idea input */}
      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddIdea();
          }
        }}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Idea Title"
        disabled={loading}
      />
      <textarea
        value={newDesc}
        onChange={(e) => setNewDesc(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleAddIdea();
          }
        }}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Description... (Ctrl+Enter to save)"
        rows="3"
        disabled={loading}
      />
      {/* Ideas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((idea) => (
          <div
            key={idea.id}
            className="p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-purple-300/10 rounded-lg shadow-md hover:scale-[1.02] hover:shadow-2xl transition duration-300"
          >
            {editingId === idea.id ? (
              <div className="space-y-2">
                {/* Edit idea form */}
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
                  className="w-full p-2 bg-purple-100 dark:bg-purple-800 text-black dark:text-white rounded"
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
                  className="w-full p-2 bg-purple-100 dark:bg-purple-800 text-black dark:text-white rounded"
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
              <>
                {/* Render idea title and description */}
                <h2 className="text-xl font-semibold">{idea.title}</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {parseText(idea.description)}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {new Date(idea.created_at).toLocaleString()}
                </p>
                <div className="mt-2 flex space-x-2">
                  {/* Edit button */}
                  <button
                    onClick={() => {
                      setEditingId(idea.id);
                      setEditTitle(idea.title);
                      setEditDesc(idea.description);
                    }}
                    className="text-yellow-500 hover:text-yellow-700 text-sm"
                    disabled={loading}
                  >
                    <Pencil className="inline" size={16} />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                    disabled={loading}
                  >
                    <Trash2 className="inline" size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {/* Floating add button */}
      <FloatingButton onClick={handleAddIdea} icon="+" label="Add Idea" />
    </div>
  );
}

export default Ideas;
