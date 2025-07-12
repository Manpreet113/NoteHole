// Ideas.jsx
// Ideas board page: create, edit, delete, and search ideas (Supabase sync for logged-in users, localStorage for guests)
import { useState, useEffect, useMemo, useRef } from 'react';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import useAuthStore from '../store/useAuthStore';
import { supabase } from '../components/supabaseClient';
import FloatingButton from '../components/FloatingButton';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';
import { setPageSEO } from '../utils/seo.js';

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
  const { user, loading: authLoading } = useAuthStore();
  const userId = user?.id;
  const [ideas, setIdeas] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const editTitleRef = useRef(null);

  // Global search query from store
  const { searchQuery, setIdeas: setSearchIdeas } = useSearchStore();

  // Load ideas from Supabase or localStorage on mount or login/logout
  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    const loadIdeas = async () => {
      setLoadingFetch(true);
      if (userId) {
        try {
          const data = await fetchIdeas(userId);
          setIdeas(data || []);
        } catch (e) {
          console.error('Failed to fetch ideas from Supabase:', e);
          setIdeas([]);
          toast.error('Failed to fetch ideas from Supabase');
        }
      } else {
        const saved = localStorage.getItem('ideas');
        setIdeas(saved ? JSON.parse(saved) : []);
      }
      setLoadingFetch(false);
    };
    loadIdeas();
  }, [userId, authLoading]);

  // Sync ideas with search store whenever ideas change
  useEffect(() => {
    setSearchIdeas(ideas);
  }, [ideas, setSearchIdeas]);

  // Persist to localStorage if not logged in
  useEffect(() => {
    if (!authLoading && !userId) {
    const isHydrated = JSON.parse(localStorage.getItem('ideas') || '[]');

    // Only save if there's something to actually persist
    if (ideas.length > 0) {
      localStorage.setItem('ideas', JSON.stringify(ideas));
    }

    // Optional: prevent overwriting if data already exists
    else if (isHydrated.length > 0) {
      // Don't overwrite localStorage with empty state
    }
  }
}, [ideas, userId, authLoading]);

  // Add a new idea
  const addIdea = async () => {
    if (!newTitle.trim()) return;
    setLoadingAction(true);
    const idea = {
      id: crypto.randomUUID(),
      title: newTitle,
      description: newDesc,
      created_at: new Date().toISOString(),
    };
    if (userId && navigator.onLine) {
      try {
        const saved = await addIdeaToSupabase(idea, userId);
        setIdeas([saved, ...ideas]);
        toast.success('Idea added!');
      } catch (e) {
        console.error('Failed to add idea to Supabase:', e);
        toast.error('Failed to add idea');
      }
    } else {
      // Save locally with synced: false
      const offlineIdea = { ...idea, synced: false };
      const saved = localStorage.getItem('ideas');
      let arr = [];
      try {
        arr = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(arr)) arr = [];
      } catch { arr = []; }
      arr.unshift(offlineIdea);
      localStorage.setItem('ideas', JSON.stringify(arr));
      setIdeas([offlineIdea, ...ideas]);
      toast.success('Idea added locally!');
    }
    setNewTitle('');
    setNewDesc('');
    setLoadingAction(false);
  };

  // Save edits to an idea (handles both online and offline)
  const saveEdit = async (id) => {
    setLoadingAction(true);
    if (userId) {
      try {
        const updated = await updateIdeaInSupabase({ id, title: editTitle, description: editDesc }, userId);
        setIdeas(ideas.map((idea) => (idea.id === id ? updated : idea)));
        toast.success('Idea updated!');
      } catch (e) {
        toast.error('Failed to update idea');
      }
    } else {
      setIdeas(
        ideas.map((idea) =>
          idea.id === id
            ? { ...idea, title: editTitle, description: editDesc }
            : idea
        )
      );
      toast.success('Idea updated locally!');
    }
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
    setLoadingAction(false);
  };

  // Delete an idea (handles both online and offline)
  const deleteIdea = async (id) => {
    setLoadingAction(true);
    if (userId) {
      try {
        await deleteIdeaFromSupabase(id, userId);
        setIdeas(ideas.filter((i) => i.id !== id));
        toast.success('Idea deleted!');
      } catch (e) {
        toast.error('Failed to delete idea');
      }
    } else {
      setIdeas(ideas.filter((i) => i.id !== id));
      toast.success('Idea deleted locally!');
    }
    setLoadingAction(false);
  };

  // Focus edit input when editing
  useEffect(() => {
    if (editingId && editTitleRef.current) {
      editTitleRef.current.focus();
    }
  }, [editingId]);

  // Set SEO for Ideas page
  useEffect(() => {
    setPageSEO({
      title: 'Ideas – NoteHole',
      description: 'Capture, organize, and develop your creative ideas. Visual grid, search, and cross-linking for your next big thing.',
      canonical: 'https://notehole.app/ideas'
    });
  }, []);

  // Memoized Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    // Only create Fuse if ideas change
    return new Fuse(ideas, {
      keys: ['title', 'description'],
      threshold: 0.3,
    });
  }, [ideas]);

  // Filtered ideas based on search query
  const filtered =
    searchQuery.trim() === ''
      ? ideas
      : fuse.search(searchQuery).map((r) => r.item);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Ideas Board</h1>
      {/* Show loading or saving state */}
      {(loadingFetch || loadingAction) && <div className="text-center text-gray-500 mb-4">{loadingFetch ? 'Loading...' : 'Saving...'}</div>}
      {/* New idea input */}
      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addIdea();
          }
        }}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Idea Title"
        disabled={loadingAction}
      />
      <textarea
        value={newDesc}
        onChange={(e) => setNewDesc(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            addIdea();
          }
        }}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Description... (Ctrl+Enter to save)"
        rows="3"
        disabled={loadingAction}
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
                      saveEdit(idea.id);
                    }
                  }}
                  className="w-full p-2 bg-purple-100 dark:bg-purple-800 text-black dark:text-white rounded"
                  disabled={loadingAction}
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      saveEdit(idea.id);
                    }
                  }}
                  className="w-full p-2 bg-purple-100 dark:bg-purple-800 text-black dark:text-white rounded"
                  rows="3"
                  disabled={loadingAction}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveEdit(idea.id)}
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
              </div>
            ) : (
              <>
                {/* Render idea title and description */}
                <h2 className="text-xl font-semibold">{idea.title}</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {parseText(idea.description)}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {new Date(idea. created_at).toLocaleString()}
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
                    disabled={loadingAction}
                  >
                     e
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                    disabled={loadingAction}
                  >
                     15
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {/* Floating add button */}
      <FloatingButton onClick={addIdea} icon="+" label="Add Idea" />
    </div>
  );
}

export default Ideas;
