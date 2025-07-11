import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import LogTable from './LogTable'
import Login from './Login'
import { Moon, Sun } from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_, session) => setSession(session))
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
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
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h1 className="text-lg font-semibold">SilentAudit</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              className="text-sm font-medium px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Device Activity Logs</h2>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
            <LogTable />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SilentAudit by Tarka. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
