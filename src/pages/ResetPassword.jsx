import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../components/supabaseClient';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      const redirectTo = window.location.origin + '/auth/callback';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw new Error(error.message);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  return (
    <main className="w-full h-screen flex flex-col items-center justify-center px-2 sm:px-4">
      <div className="max-w-xs sm:max-w-sm w-full border p-4 sm:p-10 rounded-3xl text-gray-600 space-y-6">
        <button
          type="button"
          className="mb-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 underline bg-transparent border-none cursor-pointer"
          style={{ padding: 0 }}
          onClick={() => navigate('/login')}
        >
          ← Back to login
        </button>
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-secondary)' }}>NoteHole</h1>
          <div className="mt-6 sm:mt-10">
            <h2 className="text-gray-800 text-lg sm:text-2xl font-bold sm:text-3xl">
              Reset your password
            </h2>
          </div>
        </div>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="font-medium text-sm sm:text-base">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-2 sm:px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg text-sm sm:text-base"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4">
            Send password reset email
          </button>
        </form>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm text-center">{message}</p>}
      </div>
    </main>
  );
}
