import { Link } from 'react-router-dom';
import Nav from '../components/Nav';

function Landing() {
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

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black flex flex-col items-center">
      {/* <Nav /> */}
      <header className="w-full max-w-4xl px-4 py-6 flex justify-between items-center">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-secondary)" }}
        >
          BrainDump
        </h1>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition duration-200">
          Login/Sign-up
        </button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
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
      <section className="w-full max-w-4xl px-4 py-10">
        <h3 className="text-3xl font-bold mb-8 text-center">
          Core Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200"
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
    </div>
    );
  }

export default Landing;