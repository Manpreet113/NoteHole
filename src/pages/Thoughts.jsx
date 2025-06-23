import { useState, useEffect } from 'react';
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
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const { searchQuery } = useSearchStore();

  useEffect(() => {
    localStorage.setItem('thoughts', JSON.stringify(thoughts));
  }, [thoughts]);

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
      className='relative min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white'
    >
      <div
        className="pointer-events-none fixed top-0 left-0 w-full h-full z-0"
        style={{
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(168, 85, 247, 0.25), transparent 16%)`,
          transition: 'background 0.1s ease-out',
          willChange: 'background',
        }}
      />
      <main className="relative z-10 pt-20 px-6 md:px-20 lg:px-36">
        <h1 className="text-4xl font-bold mb-4">Thoughts Dump Zone</h1>

        <div className="mb-6 space-y-4">

          <input
            type="text"
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Dump a thought... (e.g., @idea:dark-mode)"
          />
        </div>
        <div>
          <button
          onClick={addThought}
          className="fixed bottom-6 right-6 bg-purple-600 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-700 shadow-xl backdrop-blur-md border border-purple-300"
        >
          Add Task
        </button>

          <ul className="space-y-4 mt-6">
            {filteredThoughts.map((thought) => (
              <li
                key={thought.id}
                className="bg-white/5 border border-purple-200/10 backdrop-blur-sm p-4 rounded-lg flex items-center justify-between shadow-md"
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
    </div>
  );
}

export default Thoughts;
