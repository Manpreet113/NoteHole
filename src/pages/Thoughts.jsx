import { useState, useEffect } from 'react';

function Thoughts() {
  // Load initial state directly from LocalStorage
  const [thoughts, setThoughts] = useState(() => {
    const savedThoughts = localStorage.getItem('thoughts');
    return savedThoughts ? JSON.parse(savedThoughts) : [];
  });
  const [newThought, setNewThought] = useState('');

  // Only save to LocalStorage when thoughts change
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      <h1 className="text-3xl font-bold mb-4">Thoughts Dump Zone</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newThought}
          onChange={(e) => setNewThought(e.target.value)}
          className="w-full p-2 bg-gray-800 text-white rounded"
          placeholder="Dump a thought..."
        />
      </div>
      <button
        onClick={addThought}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
      >
        +
      </button>
      <ul className="space-y-2">
        {thoughts.map((thought) => (
          <li key={thought.id} className="p-2 bg-gray-800 rounded">
            {thought.text} <span className="text-gray-400 text-sm">({new Date(thought.createdAt).toLocaleString()})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Thoughts;