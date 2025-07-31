// Tasks.jsx
// Task manager page: create, complete, delete, and filter tasks (Supabase sync for logged-in users, localStorage for guests)
import { useState, useEffect, useMemo, useRef } from 'react';
import { parseText } from '../utils/parseText';
import FloatingButton from '../components/FloatingButton';
import useAuthStore from '../store/useAuthStore';
import useSearchStore from '../store/useSearchStore';
import useTasksStore from '../store/useTasksStore';
import { supabase } from '../components/supabaseClient';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';
import { encryptData, decryptData } from '../utils/e2ee';
import { Pencil, Trash2 } from 'lucide-react';

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
  // All hooks at the top
  const { user, loading: authLoading, e2eeKey } = useAuthStore();
  const userId = user?.id;
  const { tasks, loading, dataReady, fetchTasks, addTask, editTask, toggleTask, deleteTask, reset } = useTasksStore();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef(null);
  const { searchQuery, setTasks: setTasksTasks } = useSearchStore();

  useEffect(() => {
    if (authLoading) return;
    if (userId && !e2eeKey) return;
    if (userId && e2eeKey) {
      fetchTasks();
    } else {
      reset();
    }
  }, [userId, e2eeKey, authLoading, fetchTasks, reset]);

  useEffect(() => {
    setTasksTasks(tasks);
  }, [tasks, setTasksTasks]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const fuse = useMemo(() => {
    return new Fuse(tasks, {
      keys: ['name'],
      threshold: 0.3,
    });
  }, [tasks]);

  // Only render after all hooks
  if (authLoading || (userId && !e2eeKey) || !dataReady) {
    return <div className="text-center text-gray-500 mb-4">Loading...</div>;
  }

  // Add a new task
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addTask(newTask);
    setNewTask('');
  };

  // Save edits to a task
  const handleSaveEdit = async (id) => {
    await editTask(id, editText);
    setEditingId(null);
    setEditText('');
  };

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
    <div>
      <h1 className="text-4xl font-bold mb-6">Task Manager</h1>
      {/* Show loading or saving state */}
      {loading && <div className="text-center text-gray-500 mb-4">Saving...</div>}
      {/* New task input */}
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddTask();
          }
        }}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Add a task... (e.g., @idea:dark-mode)"
        disabled={loading}
      />
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
            disabled={loading}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      {/* Task list */}
      <ul className="space-y-3">
        {filtered.map((task) => (
          <li
            key={task.id}
            className="bg-white/10 dark:bg-white/5 border border-purple-200/10 backdrop-blur-md p-4 rounded-lg flex items-center justify-between shadow-md"
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
                      handleSaveEdit(task.id);
                    }
                  }}
                  className="flex-1 p-2 bg-purple-100 dark:bg-purple-800 text-black dark:text-white rounded"
                  disabled={loading}
                />
                <button
                  onClick={() => handleSaveEdit(task.id)}
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
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.is_done}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.name} as ${task.is_done ? 'incomplete' : 'done'}`}
                    className="h-5 w-5 text-purple-600"
                    disabled={loading}
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
                    {new Date(task.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setEditText(task.name);
                    }}
                    className="text-yellow-500 hover:text-yellow-700 text-sm"
                    disabled={loading}
                  >
                    <Pencil className="inline" size={16} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
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
      <FloatingButton onClick={handleAddTask} icon="+" label="Add Task" />
    </div>
  );
}

export default Tasks;
