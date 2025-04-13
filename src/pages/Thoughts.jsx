import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import SearchBar from '../components/SearchBar';
import { parseText } from '../utils/parseText.jsx';

function Thoughts() {
  const [thoughts, setThoughts] = useState(() => {
    const savedThoughts = localStorage.getItem('thoughts');
    return savedThoughts ? JSON.parse(savedThoughts) : [];
  });
  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredThoughts = thoughts.filter((thought) =>
    thought.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Nav />
      <div className="p-6 relative">
        <h1 className="text-3xl font-bold mb-4">Thoughts Dump Zone</h1>
        <div className="mb-4 space-y-2">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search thoughts..."
          />
          <input
            type="text"
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Dump a thought... (e.g., @idea:dark-mode or @task:buy-milk)"
          />
        </div>
        <button
          onClick={addThought}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
        >
          +
        </button>
        <ul className="space-y-2">
          {filteredThoughts.map((thought) => (
            <li
              key={thought.id}
              className="p-2 bg-gray-800 rounded flex justify-between items-center"
            >
              {editingId === thought.id ? (
                <div className="flex w-full space-x-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 p-1 bg-gray-700 text-white rounded"
                  />
                  <button
                    onClick={() => saveEdit(thought.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
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
    </div>
  );
}

export default Thoughts;