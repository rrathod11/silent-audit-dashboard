import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import LogTable from './LogTable'
import Login from './Login'
import { Moon, Sun } from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)
  const [isDark, setIsDark] = useState(() => {
    // Read dark mode preference from localStorage
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_, session) => setSession(session))
  }, [])

  useEffect(() => {
    // Apply dark mode class to <html> element
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white font-sans">
      {session ? (
        <Dashboard session={session} isDark={isDark} setIsDark={setIsDark} />
      ) : (
        <Login />
      )}
    </div>
  )
}

function Dashboard({ session, isDark, setIsDark }) {
  return (
    <>
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
            SilentAudit
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Device Activity Logs</h2>
        <LogTable />
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 dark:text-gray-400 mt-10 pb-6">
        © {new Date().getFullYear()} <strong>SilentAudit</strong> by Tarka. All rights reserved.
      </footer>
    </>
  )
}

export default App
