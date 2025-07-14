import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import useAuthStore from '../store/useAuthStore';
import { supabase } from '../components/supabaseClient';
import FloatingButton from '../components/FloatingButton';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';
import { setPageSEO } from '../utils/seo.js';

// Supabase helpers
async function fetchThoughts(userId) {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function addThoughtToSupabase(thought, userId) {
  const { data, error } = await supabase
    .from('thoughts')
    .insert([{ ...thought, user_id: userId }])
    .select();
  if (error) throw error;
  return data[0];
}

async function updateThoughtInSupabase(thought, userId) {
  const { data, error } = await supabase
    .from('thoughts')
    .update({ thought: thought.thought })
    .eq('id', thought.id)
    .eq('user_id', userId)
    .select();
  if (error) throw error;
  return data[0];
}

async function deleteThoughtFromSupabase(id, userId) {
  const { error } = await supabase
    .from('thoughts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// --- Offline sync hook ---
function useNoteSync(userId, addThoughtToSupabase, setThoughts) {
  useEffect(() => {
    // Helper: get unsynced notes from localStorage
    function getUnsyncedNotes() {
      const saved = localStorage.getItem('thoughts');
      if (!saved) return [];
      try {
        const arr = JSON.parse(saved);
        return Array.isArray(arr) ? arr.filter((n) => n.synced === false) : [];
      } catch {
        return [];
      }
    }

    // Helper: remove synced notes from localStorage
    function removeSyncedNotes(syncedIds) {
      const saved = localStorage.getItem('thoughts');
      if (!saved) return;
      try {
        const arr = JSON.parse(saved);
        const filtered = arr.filter((n) => !syncedIds.includes(n.id));
        localStorage.setItem('thoughts', JSON.stringify(filtered));
      } catch {}
    }

    // Sync function
    async function syncNotes() {
      if (!userId || !navigator.onLine) return;
      const unsynced = getUnsyncedNotes();
      if (!unsynced.length) return;
      const syncedIds = [];
      for (const note of unsynced) {
        try {
          // Remove synced flag before sending
          const { synced, ...toSave } = note;
          const saved = await addThoughtToSupabase(toSave, userId);
          setThoughts((prev) => [saved, ...prev.filter((n) => n.id !== note.id)]);
          syncedIds.push(note.id);
        } catch (e) {
          // If any fail, skip removal
        }
      }
      if (syncedIds.length) removeSyncedNotes(syncedIds);
    }

    // Sync on login or online
    if (userId && navigator.onLine) {
      syncNotes();
    }

    // Listen for coming online
    function handleOnline() {
      if (userId) syncNotes();
    }
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [userId, addThoughtToSupabase, setThoughts]);
}

function Thoughts() {
  const { user, loading: authLoading } = useAuthStore();
  const userId = user?.id;
  const [thoughts, setThoughts] = useState([]);
  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const editInputRef = useRef(null);

  // Global search query from store
  const { searchQuery, setThoughts: setSearchThoughts } = useSearchStore();

  // Load thoughts from Supabase or localStorage on mount or login/logout
  useEffect(() => {
  if (authLoading) return;

  const loadThoughts = async () => {
    setLoadingFetch(true);
    if (userId) {
      try {
        const data = await fetchThoughts(userId);
        setThoughts(data || []);
      } catch (e) {
        console.error('Failed to fetch thoughts from Supabase:', e);
        setThoughts([]);
        toast.error('Failed to fetch thoughts from Supabase');
      }
    } else {
      const saved = localStorage.getItem('thoughts');
      setThoughts(saved ? JSON.parse(saved) : []);
    }
    setLoadingFetch(false);
  };

  loadThoughts();
}, [userId, authLoading]);

  // Sync thoughts with search store whenever thoughts change
  useEffect(() => {
    setSearchThoughts(thoughts);
  }, [thoughts, setSearchThoughts]);

  // Persist to localStorage if not logged in
  useEffect(() => {
  if (!authLoading && !userId) {
    const isHydrated = JSON.parse(localStorage.getItem('thoughts') || '[]');

    // Only save if there's something to actually persist
    if (thoughts.length > 0) {
      localStorage.setItem('thoughts', JSON.stringify(thoughts));
    }

    // Optional: prevent overwriting if data already exists
    else if (isHydrated.length > 0) {
      // Don't overwrite localStorage with empty state
    }
  }
}, [thoughts, userId, authLoading]);

  // Add offline sync logic
  useNoteSync(userId, addThoughtToSupabase, setThoughts);

  // Add a new thought (handles both online and offline)
  const addThought = async () => {
    if (!newThought.trim()) return;
    setLoadingAction(true);
    const thought = {
      id: crypto.randomUUID(),
      thought: newThought,
      created_at: new Date().toISOString(),
    };
    if (userId && navigator.onLine) {
      try {
        const saved = await addThoughtToSupabase(thought, userId);
        setThoughts([saved, ...thoughts]);
        toast.success('Thought added!');
      } catch (e) {
        console.error('Failed to add thought to Supabase:', e);
        toast.error('Failed to add thought');
      }
    } else {
      // Save locally with synced: false
      const offlineThought = { ...thought, synced: false };
      const saved = localStorage.getItem('thoughts');
      let arr = [];
      try {
        arr = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(arr)) arr = [];
      } catch { arr = []; }
      arr.unshift(offlineThought);
      localStorage.setItem('thoughts', JSON.stringify(arr));
      setThoughts([offlineThought, ...thoughts]);
      toast.success('Thought added locally!');
    }
    setNewThought('');
    setLoadingAction(false);
  };

  // Save edits to a thought (handles both online and offline)
  const saveEdit = async (id) => {
    setLoadingAction(true);
    if (userId) {
      try {
        const updated = await updateThoughtInSupabase({ id, thought: editText }, userId);
        setThoughts(thoughts.map((t) => (t.id === id ? updated : t)));
        toast.success('Thought updated!');
      } catch (e) {
        toast.error('Failed to update thought');
      }
    } else {
      setThoughts(
        thoughts.map((t) => (t.id === id ? { ...t, thought: editText } : t))
      );
      toast.success('Thought updated locally!');
    }
    setEditingId(null);
    setEditText('');
    setLoadingAction(false);
  };

  // Delete a thought (handles both online and offline)
  const deleteThought = async (id) => {
    setLoadingAction(true);
    if (userId) {
      try {
        await deleteThoughtFromSupabase(id, userId);
        setThoughts(thoughts.filter((t) => t.id !== id));
        toast.success('Thought deleted!');
      } catch (e) {
        toast.error('Failed to delete thought');
      }
    } else {
      setThoughts(thoughts.filter((t) => t.id !== id));
      toast.success('Thought deleted locally!');
    }
    setLoadingAction(false);
  };

  // Focus edit input when editing
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

  // Filtered thoughts based on search query
  const filtered =
    searchQuery.trim() === ''
      ? thoughts
      : fuse.search(searchQuery).map((r) => r.item);

  return (
    <div className="min-h-screen text-black dark:text-white flex flex-col text-xs sm:text-base">
      <h1 className="text-4xl font-bold mb-6">Thoughts Dump Zone</h1>
      {/* Show loading or saving state */}
      {(loadingFetch || loadingAction) && <div className="text-center text-gray-500 mb-4">{loadingFetch ? 'Loading...' : 'Saving...'}</div>}
      {/* New thought input */}
      <form
        onSubmit={e => { e.preventDefault(); addThought(); }}
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
          disabled={loadingAction}
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
    saveEdit(thought.id);
  }
}}

                  className="flex-1 p-2 bg-purple-700 text-white rounded"
                  disabled={loadingAction}
                />
                <button
                  onClick={() => saveEdit(thought.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  disabled={loadingAction}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                  disabled={loadingAction}
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
                    ({new Date(thought. created_at).toLocaleString()})
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
                    disabled={loadingAction}
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => deleteThought(thought.id)}
                    className="btn btn-ghost btn-sm text-red-400 hover:text-red-600"
                    disabled={loadingAction}
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
      <FloatingButton onClick={addThought} label="Add Thought" icon="+" />
    </div>
  );
}

export default Thoughts;