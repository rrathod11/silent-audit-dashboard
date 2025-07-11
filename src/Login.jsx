import { supabase } from './supabaseClient'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  const login = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    setMsg(error ? error.message : 'Check your email for login link!')
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl mb-4">SilentAudit Login</h1>
      <input
        type="email"
        placeholder="Your email"
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-2"
      />
      <button onClick={login} className="bg-blue-600 text-white px-4 py-2">
        Send Login Link
      </button>
      {msg && <p className="mt-4 text-green-600">{msg}</p>}
    </div>
  )
}
