// Tasks.jsx
// Task manager page: create, complete, delete, and filter tasks (Supabase sync for logged-in users, localStorage for guests)
import { useState, useEffect, useMemo, useRef } from 'react';
import { parseText } from '../utils/parseText';
import FloatingButton from '../components/FloatingButton';
import useAuthStore from '../store/useAuthStore';
import useSearchStore from '../store/useSearchStore';
import { supabase } from '../components/supabaseClient';
import toast from 'react-hot-toast';
import Fuse from 'fuse.js';

// Supabase helpers
async function fetchTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
}

async function addTaskToSupabase(task, userId) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, user_id: userId }]);
  if (error) throw error;
  return data[0];
}

async function updateTaskInSupabase(task, userId) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ name: task.name, completed: task.completed })
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
      console.log('Auth still loading, skipping task load');
      return;
    }
    
    const loadTasks = async () => {
      setLoadingFetch(true);
      console.log('Loading tasks - userId:', userId);
      if (userId) {
        try {
          const data = await fetchTasks(userId);
          console.log('Loaded tasks from Supabase:', data);
          setTasks(data || []);
        } catch (e) {
          console.error('Failed to fetch tasks from Supabase:', e);
          setTasks([]);
          toast.error('Failed to fetch tasks from Supabase');
        }
      } else {
        const saved = localStorage.getItem('tasks');
        console.log('Loading tasks from localStorage:', saved);
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
    console.log('Tasks useEffect - userId:', userId, 'authLoading:', authLoading, 'tasks count:', tasks.length);
    if (!authLoading && !userId) {
      console.log('Saving tasks to localStorage:', tasks);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } else if (authLoading) {
      console.log('Auth still loading, skipping localStorage save');
    } else {
      console.log('User is logged in, not saving to localStorage');
    }
  }, [tasks, userId, authLoading]);

  // Add a new task
  const addTask = async () => {
    if (!newTask.trim()) return;
    console.log('Adding task - userId:', userId, 'task:', newTask);
    setLoadingAction(true);
    const task = {
      id: crypto.randomUUID(),
      name: newTask,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    if (userId) {
      try {
        const saved = await addTaskToSupabase(task, userId);
        console.log('Saved task to Supabase:', saved);
        setTasks([saved, ...tasks]);
        toast.success('Task added!');
      } catch (e) {
        console.error('Failed to add task to Supabase:', e);
        toast.error('Failed to add task');
      }
    } else {
      console.log('Adding task locally:', task);
      setTasks([task, ...tasks]);
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
        const updated = await updateTaskInSupabase({ id, name: editText, completed: false }, userId);
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

  // Toggle task completion
  const toggleTask = async (id) => {
    setLoadingAction(true);
    if (userId) {
      try {
        const task = tasks.find((t) => t.id === id);
        const updated = await updateTaskInSupabase({ id, name: task.name, completed: !task.completed }, userId);
        setTasks(tasks.map((t) => (t.id === id ? updated : t)));
        toast.success('Task updated!');
      } catch (e) {
        toast.error('Failed to update task');
      }
    } else {
      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
      toast.success('Task updated locally!');
    }
    setLoadingAction(false);
  };

  // Delete a task
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

  // Memoized Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(tasks, {
      keys: ['name'],
      threshold: 0.3,
    });
  }, [tasks]);

  // Filtered tasks based on search and filter
  const filtered = fuse
    .search(searchQuery.trim() || '')
    .map((r) => r.item)
    .filter((t) => {
      if (filter === 'pending') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    });

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Task Manager</h1>
      {(loadingFetch || loadingAction) && <div className="text-center text-gray-500 mb-4">{loadingFetch ? 'Loading...' : 'Saving...'}</div>}
      {/* New task input */}
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addTask();
          }
        }}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Add a task... (e.g., @idea:dark-mode)"
        disabled={loadingAction}
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
            disabled={loadingAction}
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
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="h-5 w-5 text-purple-600"
                    disabled={loadingAction}
                  />
                  <span
                    className={`text-base ${
                      task.completed ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {parseText(task.name)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setEditText(task.name);
                    }}
                    className="text-yellow-500 hover:text-yellow-700 text-sm"
                    disabled={loadingAction}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
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
      <FloatingButton onClick={addTask} icon="+" label="Add Task" />
    </div>
  );
}

export default Tasks;
