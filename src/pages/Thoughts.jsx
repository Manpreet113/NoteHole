// Thoughts.jsx
// Thoughts dump page: create, edit, delete, and search thoughts (Supabase sync for logged-in users, localStorage for guests)
import { useState, useEffect, useMemo, useRef } from 'react';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import useAuthStore from '../store/useAuthStore';
import { supabase } from '../components/supabaseClient';
import FloatingButton from '../components/FloatingButton';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';

// Supabase helpers
async function fetchThoughts(userId) {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('user_id', userId)
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
}

async function addThoughtToSupabase(thought, userId) {
  const { data, error } = await supabase
    .from('thoughts')
    .insert([{ ...thought, user_id: userId }]);
  if (error) throw error;
  return data[0];
}

async function updateThoughtInSupabase(thought, userId) {
  const { data, error } = await supabase
    .from('thoughts')
    .update({ text: thought.text })
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

function Thoughts() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const [thoughts, setThoughts] = useState([]);
  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const editInputRef = useRef(null);

  // Global search query from store
  const { searchQuery } = useSearchStore();

  // Load thoughts from Supabase or localStorage on mount or login/logout
  useEffect(() => {
    const loadThoughts = async () => {
      setLoadingFetch(true);
      if (userId) {
        try {
          const data = await fetchThoughts(userId);
          setThoughts(data || []);
        } catch (e) {
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
  }, [userId]);

  // Persist to localStorage if not logged in
  useEffect(() => {
    if (!userId) {
      localStorage.setItem('thoughts', JSON.stringify(thoughts));
    }
  }, [thoughts, userId]);

  // Add a new thought
  const addThought = async () => {
    if (!newThought.trim()) return;
    setLoadingAction(true);
    const thought = {
      id: crypto.randomUUID(),
      text: newThought,
      createdAt: new Date().toISOString(),
    };
    if (userId) {
      try {
        const saved = await addThoughtToSupabase(thought, userId);
        setThoughts([saved, ...thoughts]);
        toast.success('Thought added!');
      } catch (e) {
        toast.error('Failed to add thought');
      }
    } else {
      setThoughts([thought, ...thoughts]);
      toast.success('Thought added locally!');
    }
    setNewThought('');
    setLoadingAction(false);
  };

  // Save edits to a thought
  const saveEdit = async (id) => {
    setLoadingAction(true);
    if (userId) {
      try {
        const updated = await updateThoughtInSupabase({ id, text: editText }, userId);
        setThoughts(thoughts.map((t) => (t.id === id ? updated : t)));
        toast.success('Thought updated!');
      } catch (e) {
        toast.error('Failed to update thought');
      }
    } else {
      setThoughts(
        thoughts.map((t) => (t.id === id ? { ...t, text: editText } : t))
      );
      toast.success('Thought updated locally!');
    }
    setEditingId(null);
    setEditText('');
    setLoadingAction(false);
  };

  // Delete a thought
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

  // Memoized Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(thoughts, {
      keys: ['text'],
      threshold: 0.3,
    });
  }, [thoughts]);

  // Filtered thoughts based on search query
  const filtered =
    searchQuery.trim() === ''
      ? thoughts
      : fuse.search(searchQuery).map((r) => r.item);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Thoughts Dump Zone</h1>
      {(loadingFetch || loadingAction) && <div className="text-center text-gray-500 mb-4">{loadingFetch ? 'Loading...' : 'Saving...'}</div>}
      {/* New thought input */}
      <input
        type="text"
        value={newThought}
        onChange={(e) => setNewThought(e.target.value)}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Dump a thought... (e.g., @idea:dark-mode)"
        disabled={loadingAction}
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
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
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
                <span>
                  {parseText(thought.text)}{' '}
                  <span className="text-gray-400 text-sm">
                    ({new Date(thought.createdAt).toLocaleString()})
                  </span>
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setEditingId(thought.id);
                      setEditText(thought.text);
                    }}
                    className="text-yellow-400 hover:text-yellow-600 text-sm"
                    disabled={loadingAction}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteThought(thought.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                    disabled={loadingAction}
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {/* Floating add button */}
      <FloatingButton onClick={addThought} label="Add Thought" icon="+" />
    </div>
  );
}

export default Thoughts;