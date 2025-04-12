import { Link, useLocation } from 'react-router-dom';

function Nav() {
  const location = useLocation(); // Get current route

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          BrainDump
        </Link>
        <div className="space-x-4">
          <Link
            to="/thoughts"
            className={`hover:text-blue-400 ${
              location.pathname === '/thoughts' ? 'text-blue-400' : ''
            }`}
          >
            Thoughts
          </Link>
          <Link
            to="/ideas"
            className={`hover:text-blue-400 ${
              location.pathname === '/ideas' ? 'text-blue-400' : ''
            }`}
          >
            Ideas
          </Link>
          <Link
            to="/tasks"
            className={`hover:text-blue-400 ${
              location.pathname === '/tasks' ? 'text-blue-400' : ''
            }`}
          >
            Tasks
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Nav;