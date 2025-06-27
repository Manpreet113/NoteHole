// Login.jsx
// Login and signup form with email/password and OAuth using Supabase
import { useState } from 'react'
import useAuthStore from '../store/useAuthStore'

export default function LoginForm() {
  // Email & Password States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // UI Control States
  const [step, setStep] = useState('email') // email → password/signup
  const [authMode, setAuthMode] = useState('login') // login or signup
  const [error, setError] = useState('')
  const [emailExists, setEmailExists] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Auth store from zustand
  const { signIn, signUp, signInWithOAuth, loading } = useAuthStore();

  // Check if email is already registered
  const handleEmailCheck = async () => {
    setError('')
    try {
      // Try to sign in with a random password to check if user exists
      const { error } = await signIn({ email, password: 'random_placeholder' })
      // If invalid credentials, user exists
      if (error && error.includes('Invalid login credentials')) {
        setEmailExists(true)
        setAuthMode('login')
        setStep('password')
      }
      // If different error, probably user doesn't exist
      else if (error) {
        setEmailExists(false)
        setAuthMode('signup')
        setStep('signup')
      } else {
        // No error? Means login successful with placeholder? Shouldn't happen
        setError("Unexpected behavior, please try again.")
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.')
    }
  }

  // Log the user in
  const handleLogin = async () => {
    setError('')
    try {
      const { error } = await signIn({ email, password })
      if (error) throw new Error(error)
      // ✅ Login successful
    } catch (err) {
      setError(err.message || 'Login failed.')
    }
  }

  // Sign up new user
  const handleSignup = async () => {
    setError('')
    try {
      const { error } = await signUp({ email, password })
      if (error) throw new Error(error)
      // ✅ Signup successful (might still need email confirmation)
    } catch (err) {
      setError(err.message || 'Signup failed.')
    }
  }

  // Sign in with OAuth (Google, GitHub, etc.)
  const handleOAuth = async (provider) => {
    setError('')
    try {
      const { error } = await signInWithOAuth(provider)
      if (error) throw new Error(error)
    } catch (err) {
      setError(err.message || 'OAuth login failed.')
    }
  }

  return (
    // Main login/signup form UI
    <main className="w-full h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full border p-10 rounded-3xl text-gray-600 space-y-6">
        {/* Title and subtitle */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-secondary)" }}>BrainDump</h1>
          <div className="mt-10">
            <h2 className="text-gray-800 text-2xl font-bold sm:text-3xl">
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

        {/* Continue after email check */}
        {step === 'email' && (
          <button
            onClick={handleEmailCheck}
            disabled={loading}
            className="w-full mt-4 px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg duration-150"
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        )}

        {/* Password input and login/signup button */}
        {(step === 'password' || step === 'signup') && (
          <>
            <div>
              <label className="font-medium">Password</label>
              <div className="relative">
                {/* Password input with show/hide toggle */}
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
                  {showPassword ? (
                    // Hide password icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-5-10-5s2.239-3.294 5.383-4.877M4.5 4.5l15 15" />
                    </svg>
                  ) : (
                    // Show password icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={authMode === 'login' ? handleLogin : handleSignup}
              disabled={loading}
              className="w-full mt-4 px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg duration-150"
            >
              {loading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </>
        )}

        {/* Error message */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Switch login/signup mode */}
        <p className="text-sm text-center text-gray-500">
          {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            className="ml-1 font-medium text-indigo-600 hover:text-indigo-500"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login')
              setStep('password')
              setError('')
            }}
          >
            {authMode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>

        {/* OR Divider */}
        <div className="relative">
          <span className="block w-full h-px bg-gray-300"></span>
          <p className="inline-block w-fit text-sm dark:bg-black bg-white px-2 absolute -top-2 inset-x-0 mx-auto">Or continue with</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-4 text-sm font-medium">
          {/* Google OAuth */}
          <button
            onClick={() => handleOAuth('google')}
            className="w-full font-bold flex items-center justify-center gap-x-3 py-2.5 border rounded-lg hover:bg-gray-50 active:bg-gray-100"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
            Continue with Google
          </button>

          {/* GitHub OAuth */}
          <button
            onClick={() => handleOAuth('github')}
            className="w-full flex font-bold items-center justify-center gap-x-3 py-2.5 border rounded-lg hover:bg-gray-50 active:bg-gray-100"
          >
            <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5" alt="github" />
            Continue with Github
          </button>
        </div>

        {/* Forgot password link (not yet implemented) */}
        <div className="text-center">
          <a href="#" className="text-indigo-600 hover:text-indigo-500">Forgot password?</a>
        </div>
      </div>
    </main>
  )
}
