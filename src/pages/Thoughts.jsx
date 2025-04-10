import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Thoughts() {
  const [thoughts, setThoughts] = useState(() => {
    const savedThoughts = localStorage.getItem('thoughts');
    return savedThoughts ? JSON.parse(savedThoughts) : [];
  });
  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

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

  const parseText = (text) => {
    const ideas = JSON.parse(localStorage.getItem('ideas') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const regex = /@(idea|task):([a-z0-9-]+)/g;
    let match;
    const parts = [];
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      const type = match[1];
      const slug = match[2];
      parts.push(text.slice(lastIndex, match.index)); // Text before match

      if (type === 'idea') {
        const idea = ideas.find((i) => i.title.toLowerCase().replace(/\s+/g, '-') === slug);
        if (idea) {
          parts.push(
            <Link
              key={match.index}
              to={`/ideas#${idea.id}`}
              className="text-blue-400 hover:underline"
            >
              {match[0]}
            </Link>
          );
        } else {
          parts.push(match[0]);
        }
      } else if (type === 'task') {
        const task = tasks.find((t) => t.name.toLowerCase().replace(/\s+/g, '-') === slug);
        if (task) {
          parts.push(
            <Link
              key={match.index}
              to={`/tasks#${task.id}`}
              className="text-blue-400 hover:underline"
            >
              {match[0]}
            </Link>
          );
        } else {
          parts.push(match[0]);
        }
      }
      lastIndex = regex.lastIndex;
    }
    parts.push(text.slice(lastIndex)); // Remaining text
    return parts;
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
        {thoughts.map((thought) => (
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
  );
}

export default Thoughts;