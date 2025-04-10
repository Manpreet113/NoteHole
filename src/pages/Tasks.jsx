import { useState, useEffect } from 'react';

function Tasks() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

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

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // all
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      <h1 className="text-3xl font-bold mb-4">To-Do Manager</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="w-full p-2 bg-gray-800 text-white rounded"
          placeholder="Add a task..."
        />
      </div>
      <button
        onClick={addTask}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
      >
        +
      </button>
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Completed
        </button>
      </div>
      <ul className="space-y-2">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            id={task.id} // Add ID for linking
            className="p-2 bg-gray-800 rounded flex justify-between items-center"
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="h-5 w-5 text-blue-600"
              />
              <span className={task.completed ? 'line-through text-gray-400' : ''}>
                {task.name}
              </span>
            </div>
            <div className="flex space-x-2">
              <span className="text-gray-400 text-sm">
                ({new Date(task.createdAt).toLocaleString()})
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
    </div>
  );
}

export default Tasks;