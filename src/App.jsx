import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LogTable from './LogTable';
import Login from './Login';
import { FiSun, FiMoon, FiMapPin, FiActivity } from 'react-icons/fi';
import IndiaMap from './components/IndiaMap';
import ActivityChart from './components/ActivityChart';

function App() {
  const [session, setSession] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [deviceLocations, setDeviceLocations] = useState([
    { latitude: 19.0760, longitude: 72.8777, city: 'Mumbai' },
    { latitude: 28.7041, longitude: 77.1025, city: 'Delhi' },
    { latitude: 12.9716, longitude: 77.5946, city: 'Bangalore' }
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_, session) => setSession(session));
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {session ? (
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-indigo-600 text-xl" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SilentAudit
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium hover:shadow-md transition-all"
                  onClick={() => supabase.auth.signOut()}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <IndiaMap locations={deviceLocations} />
            </div>

            {/* Stats Section */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <StatCard 
                    title="Active Devices" 
                    value={deviceLocations.length} 
                    icon={<FiActivity className="text-2xl" />}
                    color="indigo"
                  />
                  <StatCard 
                    title="Cities" 
                    value={new Set(deviceLocations.map(l => l.city)).size} 
                    icon="📍"
                    color="emerald"
                  />
                </div>
              </div>
              <ActivityChart />
            </div>

            {/* Log Table */}
            <div className="lg:col-span-3">
              <LogTable />
            </div>
          </main>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
