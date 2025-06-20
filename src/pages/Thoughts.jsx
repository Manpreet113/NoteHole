// ✅ Updated Thoughts.jsx to match landing page theme (glassmorphism + soft colors)
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import SideBar from '../components/Sidebar.jsx';
import { parseText } from '../utils/parseText.jsx';
import useSearchStore from '../store/useSearchStore';
import Fuse from 'fuse.js';

function Thoughts() {
  const [thoughts, setThoughts] = useState(() => {
    const savedThoughts = localStorage.getItem('thoughts');
    return savedThoughts ? JSON.parse(savedThoughts) : [];
  });

  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const { searchQuery } = useSearchStore();

  useEffect(() => {
    localStorage.setItem('thoughts', JSON.stringify(thoughts));
  }, [thoughts]);

  const addThought = () => {
    if (newThought.trim() === '') return;
    const thought = {
      id: Date.now(),
      text: newThought,
      createdAt: new Date().toISOString(),
    };
    setThoughts([thought, ...thoughts]);
    setNewThought('');
  };

  const deleteThought = (id) => {
    setThoughts(thoughts.filter((thought) => thought.id !== id));
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id) => {
    setThoughts(
      thoughts.map((thought) =>
        thought.id === id ? { ...thought, text: editText } : thought
      )
    );
    setEditingId(null);
    setEditText('');
  };

  const fuse = new Fuse(thoughts, {
    keys: ['text'],
    threshold: 0.3,
  });

  const filteredThoughts =
    searchQuery.trim() === ''
      ? thoughts
      : fuse.search(searchQuery).map((result) => result.item);

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white flex flex-col items-center transition-all duration-300`}
    >
      <Nav />
      <main className="w-full px-6 pt-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Thoughts Dump Zone</h1>

        <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/10 dark:bg-white/5 p-4 rounded-xl shadow-xl">
          <input
            type="text"
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Dump a thought... (e.g., @idea:dark-mode or @task:buy-milk)"
          />

          <button
              onClick={addThought}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg"
            >
              +
          </button>

          <ul className="space-y-4 mt-6">
            {filteredThoughts.map((thought) => (
              <li
                key={thought.id}
                className="p-4 bg-gray-800 rounded-lg flex justify-between items-center shadow-md"
              >
                {editingId === thought.id ? (
                  <div className="flex w-full space-x-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 p-2 bg-purple-700 text-white rounded"
                    />
                    <button
                      onClick={() => saveEdit(thought.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Save
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
                        onClick={() => startEditing(thought.id, thought.text)}
                        className="text-yellow-400 hover:text-yellow-600 text-sm"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteThought(thought.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
      <aside>
        <SideBar />
      </aside>
    </div>
  );
}

export default Thoughts;
