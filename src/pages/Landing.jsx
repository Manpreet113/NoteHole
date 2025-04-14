import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Landing({isDark, toggleDarkMode}) {
  const features = [
    {
      name: 'Note Dump',
      icon: 'ri-file-text-line',
      pros: ['Capture fleeting thoughts', 'Quick edits', 'Cross-link ideas'],
    },
    {
      name: 'Idea Board',
      icon: 'ri-lightbulb-flash-line',
      pros: ['Organize creative sparks', 'Visual grid layout', 'Link to tasks'],
    },
    {
      name: 'Task Tracker',
      icon: 'ri-check-line',
      pros: ['Track progress', 'Filter by status', 'Link to notes'],
    },
  ];

  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId;
  
    const handleMouseMove = (e) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    };
  
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);  

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center">
      <div
        className="pointer-events-none fixed top-0 left-0 w-full h-full z-0"
        style={{
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(168, 85, 247, 0.25), transparent 16%)`,
          transition: "background 0.1s ease-out",
          willChange: "background",
        }}
      />
      <header className="pt-6 px-6 flex justify-center">
        <div className="flex items-center justify-between border fixed z-30 w-5/6 backdrop-blur-xs rounded-full px-4 py-2 shadow-lg">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-secondary)" }}
        >
          BrainDump
        </h1>
        <div className="flex items-center gap-4">
        <button
              onClick={() => toggleDarkMode(!isDark)}
              className="p-2 rounded-full hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
            >
              {isDark ? (
                <i className="ri-sun-line text-xl"></i>
              ) : (
                <i className="ri-moon-line text-xl"></i>
              )}
        </button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition duration-200">
          Login/Sign-up
        </button>
        </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col pt-24 items-center justify-center text-center px-4">
        <h2 className="text-5xl font-bold mb-4">
          Declutter your mind, one dump at a time.
        </h2>
        <p className="text-lg mb-6 max-w-lg">
          Your personal mental tracking dashboard — a minimal tool to log thoughts, track tasks, organize random ideas before they vanish into the void.
        </p>
        <Link to="/thoughts">
          <button className="bg-purple-600 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-700 transition duration-200">
            Start Organizing Now
          </button>
        </Link>
      </main>
      <section className="w-4/6 px-4 py-10">
        <h3 className="text-3xl font-bold mb-8 text-center">
          Core Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-900 z-10 p-6 rounded-lg shadow-2xs dark:hover:bg-gray-950 border hover:scale-110  hover:shadow-2xl transition duration-200"
            >
              <i className={`${feature.icon} text-3xl text-purple-600 mb-4`}></i>
              <h4 className="text-xl font-semibold mb-2">
                {feature.name}
              </h4>
              <ul className="list-disc list-inside text-sm">
                {feature.pros.map((pro, i) => (
                  <li key={i}>{pro}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="w-4/6 px-4 py-10">
        
      </section>
    </div>
    );
  }

export default Landing;