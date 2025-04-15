import { useState } from 'react'
import { supabase } from '../components/supabaseClient'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setError(error?.message || '')
    setLoading(false)
  }

  const handleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setError(error?.message || '')
    setLoading(false)
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-2">Login or Sign Up</h2>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2 w-full mb-2"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-2 w-full mb-2"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded w-full mb-2">
        Log In
      </button>
      <button onClick={handleSignup} className="bg-green-500 text-white p-2 rounded w-full">
        Sign Up
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {loading && <p>Loading...</p>}
    </div>
  )
}
