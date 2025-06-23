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
    <SearchProvider>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />} >
      <Route path="/thoughts" element={<Thoughts />} />
      <Route path="/ideas" element={<Ideas />} />
      <Route path="/tasks" element={<Tasks />} />
      </Route>
      <Route path="/login" element={<LoginForm />} />
    </Routes>
    </SearchProvider>
  );
}

export default App;