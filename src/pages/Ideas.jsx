import { useState, useEffect } from 'react';
import Nav from '../components/Nav';

function Ideas() {
  const [ideas, setIdeas] = useState(() => {
    const savedIdeas = localStorage.getItem('ideas');
    return savedIdeas ? JSON.parse(savedIdeas) : [];
  });
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  const addIdea = () => {
    if (newTitle.trim() === '') return;
    const idea = {
      id: Date.now(),
      title: newTitle,
      description: newDescription,
      createdAt: new Date().toISOString(),
    };
    setIdeas([idea, ...ideas]);
    setNewTitle('');
    setNewDescription('');
  };

  const deleteIdea = (id) => {
    setIdeas(ideas.filter((idea) => idea.id !== id));
  };

  const startEditing = (id, title, description) => {
    setEditingId(id);
    setEditTitle(title);
    setEditDescription(description);
  };

  const saveEdit = (id) => {
    setIdeas(
      ideas.map((idea) =>
        idea.id === id ? { ...idea, title: editTitle, description: editDescription } : idea
      )
    );
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Nav />
      <div className="p-6 relative">
        <h1 className="text-3xl font-bold mb-4">Ideas Board</h1>
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Idea title..."
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Description..."
            rows="3"
          />
        </div>
        <button
          onClick={addIdea}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
        >
          +
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              id={idea.id}
              className="p-4 bg-gray-800 rounded-lg shadow-md"
            >
              {editingId === idea.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded"
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
                  <p className="text-gray-300">{idea.description}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {new Date(idea.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => startEditing(idea.id, idea.title, idea.description)}
                      className="text-yellow-400 hover:text-yellow-600 text-sm"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteIdea(idea.id)}
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
      </div>
    </div>
  );
}

export default Ideas;