// ✅ Synced Ideas.jsx with Landing Page theme (glassmorphism, purple accents, clean UI)
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { parseText } from '../utils/parseText.jsx';
import useSearchStore from '../store/useSearchStore';
import useSidebarStore from '../store/useSidebarStore';
import Fuse from 'fuse.js';
import SideBar from '../components/Sidebar.jsx';

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

  const { searchQuery } = useSearchStore();
  const { isExpanded } = useSidebarStore();

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

  const fuse = new Fuse(ideas, {
    keys: ['title', 'description'],
    threshold: 0.3,
  });

  const filteredIdeas =
    searchQuery.trim() === ''
      ? ideas
      : fuse.search(searchQuery).map((result) => result.item);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white transition-all duration-300 ${isExpanded ? 'pl-64' : 'pl-20'}`}>
      <Nav />
      <div className="p-6 relative">
        <h1 className="text-3xl font-bold mb-4">Ideas Board</h1>
        <div className="mb-4 space-y-2">
          
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded"
            placeholder="Idea title..."
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded"
            placeholder="Description..."
            rows="3"
          />
        </div>
        <button
          onClick={addIdea}
          className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
        >
          +
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              id={idea.id}
              className="p-4 bg-white/90 dark:bg-white/10 backdrop-blur-md border border-purple-300/10 dark:border-white/10 rounded-lg shadow-md transition duration-300 hover:scale-[1.02] hover:shadow-2xl"
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
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
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
                      onClick={() => startEditing(idea.id, idea.title, idea.description)}
                      className="text-yellow-500 hover:text-yellow-700 text-sm"
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
        <aside>
          <SideBar />
        </aside>
      </div>
    </div>
  );
}

export default Ideas;