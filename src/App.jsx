import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Thoughts from './pages/Thoughts';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/thoughts" element={<Thoughts />} />
    </Routes>
  );
}

export default App;