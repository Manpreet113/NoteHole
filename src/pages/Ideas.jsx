import { useState, useEffect } from 'react';
import { parseText } from '../utils/parseText';
import useSearchStore from '../store/useSearchStore';
import Fuse from 'fuse.js';
import FloatingButton from '../components/FloatingButton';

function Ideas() {
  const [ideas, setIdeas] = useState(() => {
    const saved = localStorage.getItem('ideas');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const { searchQuery } = useSearchStore();

  useEffect(() => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  const addIdea = () => {
    if (!newTitle.trim()) return;
    const idea = {
      id: Date.now(),
      title: newTitle,
      description: newDesc,
      createdAt: new Date().toISOString(),
    };
    setIdeas([idea, ...ideas]);
    setNewTitle('');
    setNewDesc('');
  };

  const saveEdit = (id) => {
    setIdeas(
      ideas.map((idea) =>
        idea.id === id
          ? { ...idea, title: editTitle, description: editDesc }
          : idea
      )
    );
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  const fuse = new Fuse(ideas, {
    keys: ['title', 'description'],
    threshold: 0.3,
  });

  const filtered =
    searchQuery.trim() === ''
      ? ideas
      : fuse.search(searchQuery).map((r) => r.item);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Ideas Board</h1>

      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        placeholder="Idea Title"
      />

      <textarea
        value={newDesc}
        onChange={(e) => setNewDesc(e.target.value)}
        className="w-full px-4 py-2 bg-white/5 border border-purple-400/40 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Description..."
        rows="3"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((idea) => (
          <div
            key={idea.id}
            className="p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-purple-300/10 rounded-lg shadow-md hover:scale-[1.02] hover:shadow-2xl transition duration-300"
          >
            {editingId === idea.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 bg-purple-100 dark:bg-purple-800 text-black dark:text-white rounded"
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2 bg-purple-100 dark:bg-purple-800 text-black dark:text-white rounded"
                  rows="3"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveEdit(idea.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{idea.title}</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {parseText(idea.description)}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {new Date(idea.createdAt).toLocaleString()}
                </p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingId(idea.id);
                      setEditTitle(idea.title);
                      setEditDesc(idea.description);
                    }}
                    className="text-yellow-500 hover:text-yellow-700 text-sm"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => setIdeas(ideas.filter((i) => i.id !== idea.id))}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <FloatingButton onClick={addIdea} icon="+" label="Add Idea" />
    </div>
  );
}

export default Ideas;
