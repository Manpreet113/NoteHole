import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Thoughts from './pages/Thoughts';
import Ideas from './pages/Ideas';
import Tasks from './pages/Tasks';
import { useEffect, useState } from 'react';
import LoginForm from './pages/LoginForm';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("darkMode");
      return savedTheme ? JSON.parse(savedTheme) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // default to dark mode if we can't check
  });
  
  // Update the useEffect for dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <Routes>
      <Route path="/" element={<Landing toggleDarkMode={setDarkMode} isDark={darkMode}/>} />
      <Route path="/thoughts" element={<Thoughts />} />
      <Route path="/ideas" element={<Ideas />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/login" element={<LoginForm />} />
    </Routes>
  );
}

export default App;