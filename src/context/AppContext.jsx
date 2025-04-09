import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem("notes")) || []);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || []);
  const [ideas, setIdeas] = useState(() => JSON.parse(localStorage.getItem("ideas")) || []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("ideas", JSON.stringify(ideas));
  }, [notes, tasks, ideas]);

  return (
    <AppContext.Provider value={{ notes, setNotes, tasks, setTasks, ideas, setIdeas }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);