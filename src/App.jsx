// App.jsx
// Main app component: sets up routing and context providers for the application
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Thoughts from './pages/Thoughts';
import Ideas from './pages/Ideas';
import Tasks from './pages/Tasks';
import LoginForm from './components/Login';
import { SearchProvider } from './context/SearchContext';
import Layout from './components/Layout';

function App() {
  return (
    // Provide global search context to all routes
    <SearchProvider>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />
        {/* Main app layout with nested routes */}
        <Route element={<Layout />} >
          <Route path="/thoughts" element={<Thoughts />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/tasks" element={<Tasks />} />
        </Route>
        {/* Login page (outside main layout) */}
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </SearchProvider>
  );
}

export default App;