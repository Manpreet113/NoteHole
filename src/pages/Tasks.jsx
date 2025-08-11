import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { parseText } from '../utils/parseText';
import FloatingButton from '../components/FloatingButton';
import useAuthStore from '../store/useAuthStore';
import useSearchStore from '../store/useSearchStore';
import useTasksStore from '../store/useTasksStore';
import Fuse from 'fuse.js';
import { Pencil, Trash2 } from 'lucide-react';
import { setPageSEO } from '../utils/seo.js';

function Tasks() {
  const { user, e2eeKey } = useAuthStore();
  const { tasks, loading, hydrated, fetchTasks, addTask, editTask, toggleTask, deleteTask } = useTasksStore();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef(null);
  const { searchQuery, setTasks: setTasksTasks } = useSearchStore();

  useEffect(() => {
    if (hydrated && user && e2eeKey) {
      fetchTasks();
    }
  }, [hydrated, user, e2eeKey, fetchTasks]);

  useEffect(() => {
    setTasksTasks(tasks);
  }, [tasks, setTasksTasks]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  

  // Adds a new task.
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addTask(newTask);
    setNewTask('');
  };

  // Saves an edited task.
  const handleSaveEdit = async (id) => {
    await editTask(id, editText);
    setEditingId(null);
    setEditText('');
  };

  // Focuses the edit input when a task is being edited.
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // SEO for the Tasks page.
  useEffect(() => {
    setPageSEO({
      title: 'Tasks – NoteHole',
      description: 'Track, complete, and manage your tasks. Minimalist productivity with offline support and instant search.',
      canonical: 'https://notehole.pages.dev/tasks'
    });
  }, []);
  // Fuzzy search with Fuse.js.
  const fuse = useMemo(() => {
    return new Fuse(tasks, {
      keys: ['name'],
      threshold: 0.3,
    });
  }, [tasks]);
  
  if (!hydrated) {
    return <div className="text-center text-gray-500 mb-4">Loading...</div>;
  }


  // Filters tasks based on the search query and the current filter.
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
    <div className="min-h-screen text-black dark:text-white flex flex-col text-xs sm:text-base">
      <h1 className="text-4xl font-bold mb-6">Task Manager</h1>
      {loading && <div className="text-center text-gray-500 mb-4">Saving...</div>}
      <form
        onSubmit={e => { e.preventDefault(); handleAddTask(); }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8"
      >
        <input
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddTask();
          }
        }}
          className="flex-1 px-2 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-base"
          required
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-xs sm:text-base"
          disabled={loading}
        >
          Add
        </button>
      </form>
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
      <ul className="space-y-2 sm:space-y-4">
        {filtered.map((task) => (
          <li
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
                  <div
                    className={`text-base ${
                      task.is_done ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {parseText(task.name)}
                  </div>
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
                    className="btn btn-ghost btn-sm text-yellow-500 hover:text-yellow-700"
                    disabled={loading}
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="btn btn-ghost btn-sm text-red-400 hover:text-red-600"
                    disabled={loading}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <FloatingButton onClick={handleAddTask} icon="+" label="Add Task" />
    </div>
  );
}

export default Tasks;