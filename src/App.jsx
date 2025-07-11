import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import LogTable from './LogTable'
import Login from './Login'
import { Moon, Sun } from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_, session) => setSession(session))
  }, [])

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white font-sans">
        {session ? (
          <Dashboard session={session} isDark={isDark} setIsDark={setIsDark} />
        ) : (
          <Login />
        )}
      </div>
    </div>
  )
}

function Dashboard({ session, isDark, setIsDark }) {
  return (
    <>
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">SilentAudit</h1>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Sign Out Button */}
            <button
              className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 text-sm"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Device Activity Logs</h2>
        <LogTable />
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 dark:text-gray-400 mt-10 pb-6">
        © {new Date().getFullYear()} SilentAudit by Tarka. All rights reserved.
      </footer>
    </>
  )
}

export default App
