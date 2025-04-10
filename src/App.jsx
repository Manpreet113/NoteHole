import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Thoughts from './pages/Thoughts';
import Ideas from './pages/Ideas';
import Tasks from './pages/Tasks';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/thoughts" element={<Thoughts />} />
      <Route path="/ideas" element={<Ideas />} />
      <Route path="/tasks" element={<Tasks />} />
    </Routes>
  );
}

export default App;