import Button from '../components/Button';

function Landing() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-6">
        <h1 className="text-4xl font-bold mb-4">BrainDump</h1>
        <p className="text-lg mb-6">
          Your personal productivity OS. Dump thoughts, track ideas, get stuff done.
        </p>
        <Button to="/thoughts">Thoughts</Button><br />
        <Button to="/ideas">Ideas</Button><br />
        <Button to="/tasks">Tasks</Button>
      </div>
    </div>
  );
}

export default Landing;