// Tasks.jsx
// Task manager page: create, complete, delete, and filter tasks (Supabase sync for logged-in users, localStorage for guests)
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { parseText } from '../utils/parseText';
import FloatingButton from '../components/FloatingButton';
import useAuthStore from '../store/useAuthStore';
import useSearchStore from '../store/useSearchStore';
import { supabase } from '../components/supabaseClient';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';
import { setPageSEO } from '../utils/seo.js';

// Supabase helpers
async function fetchTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order(' created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function addTaskToSupabase(task, userId) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, user_id: userId }])
    .select();
  if (error) throw error;
  return data[0];
}

async function updateTaskInSupabase(task, userId) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ name: task.name, is_done: task.is_done })
    .eq('id', task.id)
    .eq('user_id', userId)
    .select();
  if (error) throw error;
  return data[0];
}

async function deleteTaskFromSupabase(id, userId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// --- Offline sync hook ---
function useTaskSync(userId, addTaskToSupabase, setTasks) {
  useEffect(() => {
    function getUnsyncedTasks() {
      const saved = localStorage.getItem('tasks');
      if (!saved) return [];
      try {
        const arr = JSON.parse(saved);
        return Array.isArray(arr) ? arr.filter((n) => n.synced === false) : [];
      } catch {
        return [];
      }
    }
    function removeSyncedTasks(syncedIds) {
      const saved = localStorage.getItem('tasks');
      if (!saved) return;
      try {
        const arr = JSON.parse(saved);
        const filtered = arr.filter((n) => !syncedIds.includes(n.id));
        localStorage.setItem('tasks', JSON.stringify(filtered));
      } catch {}
    }
    async function syncTasks() {
      if (!userId || !navigator.onLine) return;
      const unsynced = getUnsyncedTasks();
      if (!unsynced.length) return;
      const syncedIds = [];
      for (const task of unsynced) {
        try {
          const { synced, ...toSave } = task;
          const saved = await addTaskToSupabase(toSave, userId);
          setTasks((prev) => [saved, ...prev.filter((n) => n.id !== task.id)]);
          syncedIds.push(task.id);
        } catch (e) {}
      }
      if (syncedIds.length) removeSyncedTasks(syncedIds);
    }
    if (userId && navigator.onLine) {
      syncTasks();
    }
    function handleOnline() {
      if (userId) syncTasks();
    }
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [userId, addTaskToSupabase, setTasks]);
}

function Tasks() {
  const { user, loading: authLoading } = useAuthStore();
  const userId = user?.id;
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const editInputRef = useRef(null);

  // Global search query from store
  const { searchQuery, setTasks: setSearchTasks } = useSearchStore();

  // Load tasks from Supabase or localStorage on mount or login/logout
  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    const loadTasks = async () => {
      setLoadingFetch(true);
      if (userId) {
        try {
          const data = await fetchTasks(userId);
          setTasks(data || []);
        } catch (e) {
          console.error('Failed to fetch tasks from Supabase:', e);
          setTasks([]);
          toast.error('Failed to fetch tasks from Supabase');
        }
      } else {
        const saved = localStorage.getItem('tasks');
        setTasks(saved ? JSON.parse(saved) : []);
      }
      setLoadingFetch(false);
    };
    loadTasks();
  }, [userId, authLoading]);

  // Sync tasks with search store whenever tasks change
  useEffect(() => {
    setSearchTasks(tasks);
  }, [tasks, setSearchTasks]);

  // Persist to localStorage if not logged in
  useEffect(() => {
    if (!authLoading && !userId) {
    const isHydrated = JSON.parse(localStorage.getItem('tasks') || '[]');

    // Only save if there's something to actually persist
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Optional: prevent overwriting if data already exists
    else if (isHydrated.length > 0) {
      // Don't overwrite localStorage with empty state
    }
  }
}, [tasks, userId, authLoading]);

  useTaskSync(userId, addTaskToSupabase, setTasks);

  // Add a new task
  const addTask = async () => {
    if (!newTask.trim()) return;
    setLoadingAction(true);
    const task = {
      id: crypto.randomUUID(),
      name: newTask,
      is_done: false,
      created_at: new Date().toISOString(),
    };
    if (userId && navigator.onLine) {
      try {
        const saved = await addTaskToSupabase(task, userId);
        setTasks([saved, ...tasks]);
        toast.success('Task added!');
      } catch (e) {
        console.error('Failed to add task to Supabase:', e);
        toast.error('Failed to add task');
      }
    } else {
      // Save locally with synced: false
      const offlineTask = { ...task, synced: false };
      const saved = localStorage.getItem('tasks');
      let arr = [];
      try {
        arr = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(arr)) arr = [];
      } catch { arr = []; }
      arr.unshift(offlineTask);
      localStorage.setItem('tasks', JSON.stringify(arr));
      setTasks([offlineTask, ...tasks]);
      toast.success('Task added locally!');
    }
    setNewTask('');
    setLoadingAction(false);
  };

  // Save edits to a task
  const saveEdit = async (id) => {
    setLoadingAction(true);
    if (userId) {
      try {
        const updated = await updateTaskInSupabase({ id, name: editText, is_done: false }, userId);
        setTasks(tasks.map((task) => (task.id === id ? updated : task)));
        toast.success('Task updated!');
      } catch (e) {
        toast.error('Failed to update task');
      }
    } else {
      setTasks(
        tasks.map((task) =>
          task.id === id
            ? { ...task, name: editText }
            : task
        )
      );
      toast.success('Task updated locally!');
    }
    setEditingId(null);
    setEditText('');
    setLoadingAction(false);
  };

  // Toggle task completion (handles both online and offline)
  const toggleTask = async (id) => {
    setLoadingAction(true);
    if (userId) {
      try {
        const task = tasks.find((t) => t.id === id);
        const updated = await updateTaskInSupabase({ id, name: task.name, is_done: !task.is_done }, userId);
        setTasks(tasks.map((t) => (t.id === id ? updated : t)));
        toast.success('Task updated!');
      } catch (e) {
        toast.error('Failed to update task');
      }
    } else {
      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, is_done: !t.is_done } : t
        )
      );
      toast.success('Task updated locally!');
    }
    setLoadingAction(false);
  };

  // Delete a task (handles both online and offline)
  const deleteTask = async (id) => {
    setLoadingAction(true);
    if (userId) {
      try {
        await deleteTaskFromSupabase(id, userId);
        setTasks(tasks.filter((t) => t.id !== id));
        toast.success('Task deleted!');
      } catch (e) {
        toast.error('Failed to delete task');
      }
    } else {
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success('Task deleted locally!');
    }
    setLoadingAction(false);
  };

  // Focus edit input when editing
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Set SEO for Tasks page
  useEffect(() => {
    setPageSEO({
      title: 'Tasks – NoteHole',
      description: 'Track, complete, and manage your tasks. Minimalist productivity with offline support and instant search.',
      canonical: 'https://notehole.app/tasks'
    });
  }, []);

  // Memoized Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(tasks, {
      keys: ['name'],
      threshold: 0.3,
    });
  }, [tasks]);

  // Filtered tasks based on search and filter
  const filtered =
    searchQuery.trim() === ''
      ? tasks.filter((t) => {
          if (filter === 'pending') return !t.is_done;
          if (filter === 'completed') return t.is_done;
          return true;
        })
      : fuse
          .search(searchQuery)
          .map((r) => r.item)
          .filter((t) => {
            if (filter === 'pending') return !t.is_done;
            if (filter === 'completed') return t.is_done;
            return true;
          });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white flex flex-col text-xs sm:text-base">
      <h1 className="text-4xl font-bold mb-6">Task Manager</h1>
      {/* Show loading or saving state */}
      {(loadingFetch || loadingAction) && <div className="text-center text-gray-500 mb-4">{loadingFetch ? 'Loading...' : 'Saving...'}</div>}
      {/* New task input */}
      <form
        onSubmit={e => { e.preventDefault(); addTask(); }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8"
      >
        <input
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
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
      {/* Filter buttons */}
      <div className="my-6 flex gap-4">
        {['all', 'pending', 'completed'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1 rounded-full text-sm font-medium border transition duration-200 ${
              filter === type
                ? 'bg-purple-600 text-white border-purple-700'
                : 'bg-transparent border-gray-400 text-gray-600 dark:text-gray-300'
            }`}
            disabled={loadingAction}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      {/* Task list */}
      <ul className="space-y-2 sm:space-y-4">
        {filtered.map((task) => (
          <motion.li
            key={task.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-6 shadow-md flex flex-col gap-1 sm:gap-2"
          >
            {editingId === task.id ? (
              <div className="flex w-full space-x-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      saveEdit(task.id);
                    }
                  }}
                  className="flex-1 p-2 bg-purple-100 dark:bg-purple-800 text-black dark:text-white rounded"
                  disabled={loadingAction}
                />
                <button
                  onClick={() => saveEdit(task.id)}
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
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.is_done}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.name} as ${task.is_done ? 'incomplete' : 'done'}`}
                    className="h-5 w-5 text-purple-600"
                    disabled={loadingAction}
                  />
                  <span
                    className={`text-base ${
                      task.is_done ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {parseText(task.name)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(task. created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setEditText(task.name);
                    }}
                    className="btn btn-ghost btn-sm text-yellow-500 hover:text-yellow-700"
                    disabled={loadingAction}
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
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
      <FloatingButton onClick={addTask} icon="+" label="Add Task" />
    </div>
  );
}

export default Tasks;
