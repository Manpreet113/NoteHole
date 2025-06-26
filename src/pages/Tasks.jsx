// Tasks.jsx
// Task manager page: create, complete, delete, and filter tasks (localStorage persistence)
import { useState, useEffect } from 'react';
import { parseText } from '../utils/parseText';
import FloatingButton from '../components/FloatingButton';

function Tasks() {
  // State for tasks list, new task input, filter, and search
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist tasks to localStorage on change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Filter tasks by search and completion status
  const filtered = tasks
    .filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((t) => {
      if (filter === 'pending') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    });

  // Add a new task
  const addTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(),
      name: newTask,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  // Toggle task completion
  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Task Manager</h1>

      {/* New task input */}
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Add a task... (e.g., @idea:dark-mode)"
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
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="h-5 w-5 text-purple-600"
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
                onClick={() => deleteTask(task.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Floating add button */}
      <FloatingButton onClick={addTask} icon="+" label="Add Task" />
    </div>
  );
}

export default Tasks;
