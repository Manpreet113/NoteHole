import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

function TaskTracker() {
  const { tasks, setTasks } = useAppContext();
  const [newTask, setNewTask] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
      setNewTask("");
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const startEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const saveEdit = (id) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, text: editText } : task
    ));
    setEditId(null);
    setEditText("");
  };

  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <i className="ri-checkbox-line"></i> Task Tracker
      </h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded backdrop-blur-lg bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a task..."
        />
        <button
          onClick={addTask}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Add
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="animate-item flex items-center justify-between p-2 bg-gray-600 border text-white border-gray-200 dark:border-gray-700 rounded"
          >
            {editId === task.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => saveEdit(task.id)}
                  className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                    className="mr-2 h-4 w-4 text-purple-600 rounded"
                  />
                  <span className={task.done ? "line-through text-gray-500 dark:text-gray-400" : ""}>
                    {task.text}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(task.id, task.text)}
                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TaskTracker;