// Login.jsx
// Login and signup form with email/password and OAuth support
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { supabase } from '../components/supabaseClient';

export default function LoginForm() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('email');
  const [authMode, setAuthMode] = useState('login');
  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Auth actions and state from global store
  const { signIn, signUp, signInWithOAuth, loading, setSession } = useAuthStore();

  // Handle OAuth callback: exchange code for session
  useEffect(() => {
    supabase.auth.exchangeCodeForSession().then(({ data, error }) => {
      if (data?.session) {
        setSession(data.session);
        navigate('/');
      }
      if (error) console.error('OAuth callback error:', error.message);
    });
  }, []);

  // Handle email/password login
  const handleLogin = async () => {
    setError('');
    try {
      const { error } = await signIn({ email, password });
      if (error) throw new Error(error.message);
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };

  // Handle email/password signup
  const handleSignup = async () => {
    setError('');
    try {
      const { error } = await signUp({ email, password });
      if (error) throw new Error(error.message);
    } catch (err) {
      setError(err.message || 'Signup failed.');
    }
  };

  // Handle OAuth login (Google/Github)
  const handleOAuth = async (provider) => {
    setError('');
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) throw new Error(error.message);
    } catch (err) {
      setError(err.message || 'OAuth login failed.');
    }
  };

  return (
    <main className="w-full h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full border p-10 rounded-3xl text-gray-600 space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-secondary)' }}>NoteHole</h1>
          <div className="mt-10">
            <h2 className="text-gray-800 text-2xl font-bold sm:text-3xl">
              {/* Switch heading based on auth mode */}
              {authMode === 'login' ? 'Log in to your account' : 'Create a new account'}
            </h2>
          </div>
        </div>

        {/* Email input */}
        <div>
          <label className="font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
          />
        </div>
        {/* Password input with show/hide toggle */}
        <div>
          <label className="font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-3 py-2 pr-10 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {/* Toggle password visibility icon */}
              {showPassword ? '\ud83d\ude48' : '\ud83d\udc41\ufe0f'}
            </button>
          </div>
        </div>
        {/* Submit button for login/signup */}
        <button
          onClick={authMode === 'login' ? handleLogin : handleSignup}
          disabled={loading}
          className="w-full mt-4 px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg duration-150"
        >
          {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
        {/* Error message */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Switch between login and signup */}
        <p className="text-sm text-center text-gray-500">
          {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            className="ml-1 font-medium text-indigo-600 hover:text-indigo-500"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setStep('password');
              setError('');
            }}
          >
            {authMode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>

        {/* OAuth divider */}
        <div className="relative">
          <span className="block w-full h-px bg-gray-300"></span>
          <p className="inline-block w-fit text-sm dark:bg-black bg-white px-2 absolute -top-2 inset-x-0 mx-auto">Or continue with</p>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-4 text-sm font-medium">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full font-bold flex items-center justify-center gap-x-3 py-2.5 border rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="w-full flex font-bold items-center justify-center gap-x-3 py-2.5 border rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100"
          >
            <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5" alt="github" />
            Continue with Github
          </button>
        </div>

        {/* Forgot password link (not implemented) */}
        <div className="text-center">
          <a href="#" className="text-indigo-600 hover:text-indigo-500">Forgot password?</a>
        </div>
      </div>
    </main>
  );
}
