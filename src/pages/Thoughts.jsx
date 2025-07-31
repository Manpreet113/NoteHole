// Thoughts.jsx
// Thoughts dump page: create, edit, delete, and search thoughts (Supabase sync for logged-in users, localStorage for guests)
import { useState, useEffect, useMemo, useRef } from 'react';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import useAuthStore from '../store/useAuthStore';
import useThoughtsStore from '../store/useThoughtsStore';
import { supabase } from '../components/supabaseClient';
import FloatingButton from '../components/FloatingButton';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';
import { encryptData, decryptData } from '../utils/e2ee';
import { Pencil, Trash2 } from 'lucide-react';

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
  // All hooks at the top
  const { user, loading: authLoading, e2eeKey } = useAuthStore();
  const userId = user?.id;
  const { thoughts, loading, dataReady, fetchThoughts, addThought, editThought, deleteThought, reset } = useThoughtsStore();
  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef(null);
  const { searchQuery, setThoughts: setSearchThoughts } = useSearchStore();

  useEffect(() => {
    if (authLoading) return;
    if (userId && !e2eeKey) return;
    if (userId && e2eeKey) {
      fetchThoughts();
    } else {
      reset();
    }
  }, [userId, e2eeKey, authLoading, fetchThoughts, reset]);

  useEffect(() => {
    setSearchThoughts(thoughts);
  }, [thoughts, setSearchThoughts]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const fuse = useMemo(() => {
    return new Fuse(thoughts, {
      keys: ['thought'],
      threshold: 0.3,
    });
  }, [thoughts]);

  // Only render after all hooks
  if (authLoading || (userId && !e2eeKey) || !dataReady) {
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
    <div>
      <h1 className="text-4xl font-bold mb-6">Thoughts Dump Zone</h1>
      {/* Show loading or saving state */}
      {loading && <div className="text-center text-gray-500 mb-4">Saving...</div>}
      {/* New thought input */}
      <input
        type="text"
        value={newThought}
        onChange={(e) => setNewThought(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddThought();
          }
        }}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Dump a thought... (e.g., @idea:dark-mode)"
        disabled={loading}
      />
      {/* Thoughts list */}
      <ul className="space-y-4 mt-6">
        {filtered.map((thought) => (
          <li
            key={thought.id}
            className="bg-white/10 dark:bg-white/5 border border-purple-200/10 backdrop-blur-md p-4 rounded-lg flex items-center justify-between shadow-md"
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
                <div className="space-x-2">
                  {/* Edit button */}
                  <button
                    onClick={() => {
                      setEditingId(thought.id);
                      setEditText(thought.thought);
                    }}
                    className="text-yellow-400 hover:text-yellow-600 text-sm"
                    disabled={loading}
                  >
                    <Pencil className="inline" size={16} />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => deleteThought(thought.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                    disabled={loading}
                  >
                    <Trash2 className="inline" size={16} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {/* Floating add button */}
      <FloatingButton onClick={handleAddThought} label="Add Thought" icon="+" />
    </div>
  );
}

export default Thoughts;