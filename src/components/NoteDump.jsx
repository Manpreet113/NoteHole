import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

function NoteDump() {
  const { notes, setNotes } = useAppContext();
  const [newNote, setNewNote] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, { id: Date.now(), text: newNote }]);
      setNewNote("");
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const startEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const saveEdit = (id) => {
    setNotes(notes.map((note) =>
      note.id === id ? { ...note, text: editText } : note
    ));
    setEditId(null);
    setEditText("");
  };

  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <i className="ri-file-text-line"></i> Note Dump
      </h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded backdrop-blur-md bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Dump your thoughts..."
        />
        <button
          onClick={addNote}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Add
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {notes.map((note) => (
          <li
            key={note.id}
            className="animate-item flex items-center justify-between p-2 bg-gray-600 text-white border border-gray-200 dark:border-gray-700 rounded"
          >
            {editId === note.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => saveEdit(note.id)}
                  className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1">{note.text}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(note.id, note.text)}
                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
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

export default NoteDump;