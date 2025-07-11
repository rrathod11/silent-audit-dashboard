import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import LogTable from './LogTable'
import Login from './Login'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((__, session) => setSession(session))
  }, [])

  return session ? <Dashboard session={session} /> : <Login />
}

function Dashboard({ session }) {
  return (
    <div className="p-6">
      <button
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => supabase.auth.signOut()}
      >
        Sign Out
      </button>
      <h1 className="text-2xl mb-4">SilentAudit Dashboard</h1>
      <LogTable />
    </div>
  )
}

export default App
