// App.jsx: Main component for routing and context providers.
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Thoughts from './pages/Thoughts';
import Ideas from './pages/Ideas';
import Tasks from './pages/Tasks';
import LoginForm from './components/Login';
import Layout from './components/Layout';
import OAuthCallback from './pages/auth/Callback';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Routes>
      {/* Public landing page. */}
      <Route path="/" element={<Landing />} />
      {/* Main app layout. */}
      <Route element={<Layout />} >
        <Route path="/thoughts" element={<Thoughts />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/tasks" element={<Tasks />} />
      </Route>
      {/* Standalone login page. */}
      <Route path="/login" element={<LoginForm />} />
      {/* Password reset page */}
      <Route path="/reset-password" element={<ResetPassword />} />
  {/* OAuth callback handler */}
  <Route path="/auth/callback" element={<OAuthCallback />} />
    </Routes>
  );
}

export default App;