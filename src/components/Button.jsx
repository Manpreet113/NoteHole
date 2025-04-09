import { Link } from 'react-router-dom';

function Button({ to, children }) {
  return (
    <Link
      to={to}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
    >
      {children}
    </Link>
  );
}

export default Button;