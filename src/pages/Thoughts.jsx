// Thoughts.jsx
// Thoughts dump page: create, edit, delete, and search thoughts (localStorage persistence)
import { useState, useEffect } from 'react';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import Fuse from 'fuse.js';
import FloatingButton from '../components/FloatingButton';

function Thoughts() {
  // State for thoughts list, new thought input, and editing
  const [thoughts, setThoughts] = useState(() => {
    const saved = localStorage.getItem('thoughts');
    return saved ? JSON.parse(saved) : [];
  });
  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Global search query from store
  const { searchQuery } = useSearchStore();

  // Persist thoughts to localStorage on change
  useEffect(() => {
    localStorage.setItem('thoughts', JSON.stringify(thoughts));
  }, [thoughts]);

  // Add a new thought
  const addThought = () => {
    if (!newThought.trim()) return;
    const newT = {
      id: Date.now(),
      text: newThought,
      createdAt: new Date().toISOString(),
    };
    setThoughts([newT, ...thoughts]);
    setNewThought('');
  };

  // Save edits to a thought
  const saveEdit = (id) => {
    setThoughts(
      thoughts.map((t) => (t.id === id ? { ...t, text: editText } : t))
    );
    setEditingId(null);
    setEditText('');
  };

  // Fuzzy search for thoughts
  const fuse = new Fuse(thoughts, { keys: ['text'], threshold: 0.3 });
  const filtered = searchQuery.trim()
    ? fuse.search(searchQuery).map((r) => r.item)
    : thoughts;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Thoughts Dump Zone</h1>

      {/* New thought input */}
      <input
        type="text"
        value={newThought}
        onChange={(e) => setNewThought(e.target.value)}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Dump a thought... (e.g., @idea:dark-mode)"
      />

      {/* Thoughts list */}
      <ul className="space-y-4 mt-6">
        {filtered.map((thought) => (
          <li
            key={thought.id}
            className="bg-white/10 dark:bg-white/5 border border-purple-200/10 backdrop-blur-md p-4 rounded-lg flex items-center justify-between shadow-md"
          >
            {editingId === thought.id ? (
              <div className="flex w-full space-x-2">
                {/* Edit thought form */}
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
                    onClick={() => {
                      setEditingId(thought.id);
                      setEditText(thought.text);
                    }}
                    className="text-yellow-400 hover:text-yellow-600 text-sm"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() =>
                      setThoughts(thoughts.filter((t) => t.id !== thought.id))
                    }
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

      {/* Floating add button */}
      <FloatingButton onClick={addThought} label="Add Thought" icon="+" />
    </div>
  );
}

export default Thoughts;