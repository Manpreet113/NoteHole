import { useEffect, useState } from "react";
import NoteDump from "./components/NoteDump";
import TaskTracker from "./components/TaskTracker";
import IdeaBoard from "./components/IdeaBoard";
import Stats from "./components/Stats";
import { motion, AnimatePresence } from "framer-motion";

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
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      } transition-colors duration-300`}
    >
      <header className="pt-6 px-6 flex justify-center">
        <div className="flex items-center justify-between border fixed z-30 w-5/6 backdrop-blur-xs rounded-full px-4 py-2 shadow-lg">
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-secondary)" }}
          >
            BrainDump
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
            >
              {darkMode ? (
                <i className="ri-sun-line text-xl"></i>
              ) : (
                <i className="ri-moon-line text-xl"></i>
              )}
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-full hover:bg-purple-600 transition-colors"
            >
              <i className="ri-menu-3-line text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 pt-24 space-y-16" id="app">
        <div className="text-center space-y-5">
          <h2 className="text-6xl font-bold">Declutter your mind, one dump at a time.</h2>
          <p className="text-gray-600 text-lg">
            Your personal mental tracking dashboard — a minimal tool to log
            thoughts, track tasks, and organize random ideas before they vanish
            into the void.
          </p>
          <a
            href="#app"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Organizing Now
          </a>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-semibold text-center">Core Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Note Dump Card */}
            <div className="card bg-gray-200 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <i className="ri-file-text-line text-purple-600"></i> Note Dump
              </h4>
              <ul className="text-gray-400 space-y-1">
                <li><i className="ri-check-line text-green-500"></i> Simple text notes</li>
                <li><i className="ri-check-line text-green-500"></i> Quick capture</li>
                <li><i className="ri-check-line text-green-500"></i> Local storage</li>
              </ul>
            </div>
            {/* Task Tracker Card */}
            <div className="card bg-gray-200 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <i className="ri-checkbox-line text-purple-600"></i> Task Tracker
              </h4>
              <ul className="text-gray-400 space-y-1">
                <li><i className="ri-check-line text-green-500"></i> Complete task tracking</li>
                <li><i className="ri-check-line text-green-500"></i> Mark tasks as complete</li>
                <li><i className="ri-check-line text-green-500"></i> Simple organization</li>
              </ul>
            </div>
            {/* Idea Board Card */}
            <div className="card bg-gray-200 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <i className="ri-lightbulb-line text-purple-600"></i> Idea Board
              </h4>
              <ul className="text-gray-400 space-y-1">
                <li><i className="ri-check-line text-green-500"></i> Capture inspiration</li>
                <li><i className="ri-check-line text-green-500"></i> Organize thoughts</li>
                <li><i className="ri-check-line text-green-500"></i> Develop concepts</li>
              </ul>
            </div>
          </div>
        </div>

        <section id="note-dump" className="space-y-4">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <i className="ri-file-text-line text-purple-600"></i> Note Dump
          </h3>
          <NoteDump />
        </section>

        <section id="task-tracker" className="space-y-4">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <i className="ri-checkbox-line text-purple-600"></i> Task Tracker
          </h3>
          <TaskTracker />
        </section>

        <section id="idea-board" className="space-y-4">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <i className="ri-lightbulb-line text-purple-600"></i> Idea Board
          </h3>
          <IdeaBoard />
        </section>

        <section id="stats" className="space-y-4">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <i className="ri-bar-chart-line text-purple-600"></i> Stats
          </h3>
          <Stats />
        </section>
      </main>

      <footer className="mt-12 border-t border-gray-600 p-6 rounded-t-md text-center text-gray-500">
        <p>Built with React, rage, and a rapidly declining will to live.</p>
        <p>Don’t ask how it works. I don’t know. I blacked out.</p>
        <p>Code so scuffed, even AI refused to explain it.</p>
      </footer>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-64 h-full bg-gray-100 dark:bg-gray-950 rounded-l-xl shadow-lg z-50 p-4"
          >
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <i className="ri-close-line text-xl hover:bg-purple-600 rounded-full"></i>
            </button>
            <h4 className="text-lg font-semibold mb-4">Menu</h4>
            <ul className="space-y-2">
              <li>
                <a href="#note-dump" className="text-gray-300 hover:text-white">
                  Note Dump
                </a>
              </li>
              <li>
                <a href="#task-tracker" className="text-gray-300 hover:text-white">
                  Task Tracker
                </a>
              </li>
              <li>
                <a href="#idea-board" className="text-gray-300 hover:text-white">
                  Idea Board
                </a>
              </li>
              <li>
                <a href="#stats" className="text-gray-300 hover:text-white">
                  Stats
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-lg z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;