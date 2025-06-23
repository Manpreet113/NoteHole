import { useState, useEffect } from 'react';
import { parseText } from '../utils/parseText.jsx';

function Tasks() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    let animationFrameId;
    const handleMouseMove = (e) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const addTask = () => {
    if (newTask.trim() === '') return;
    const task = {
      id: Date.now(),
      name: newTask,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const filteredTasks = tasks
    .filter((task) =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((task) => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });

  return (
    <div className="ml-10 mr-10 relative min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white">
      {/* Radial gradient background hover effect */}
      <div
        className="pointer-events-none fixed top-0 left-0 w-full h-full z-0"
        style={{
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(168, 85, 247, 0.25), transparent 16%)`,
          transition: 'background 0.1s ease-out',
          willChange: 'background',
        }}
      />

      <main className="relative z-10 pt-20 px-6 md:px-20 lg:px-36">
        <h1 className="text-4xl font-bold mb-4">Task Manager</h1>

        <div className="mb-6 space-y-4">

          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Add a task... (e.g., @idea:dark-mode)"
          />
        </div>

        <div className="mb-6 flex gap-4">
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

        <ul className="space-y-3">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              id={task.id}
              className="bg-white/5 border border-purple-200/10 backdrop-blur-sm p-4 rounded-lg flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="h-5 w-5 text-purple-600"
                />
                <span className={`text-base ${
                  task.completed ? 'line-through text-gray-500' : ''
                }`}>
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

        <button
          onClick={addTask}
          className="fixed bottom-6 right-6 bg-purple-600 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-700 shadow-xl backdrop-blur-md border border-purple-300"
        >
          Add Task
        </button>
      </main>
    </div>
  );
}

export default Tasks;
