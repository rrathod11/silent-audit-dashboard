// App.jsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LogTable from './LogTable';
import Login from './Login';
import StatCard from './components/StatCard';

import {
  FiSun,
  FiMoon,
  FiMapPin,
  FiActivity,
  FiAlertTriangle,
  FiClock,
  FiPieChart,
  FiDownload
} from 'react-icons/fi';

import IndiaMap from './components/IndiaMap';
import ActivityChart from './components/ActivityChart';
import ProductivityScore from './components/ProductivityScore';
import AppUsageChart from './components/AppUsageChart';
import WebsiteUsageChart from './components/WebsiteUsageChart';
import ExportReport from './components/ExportReport';

function App() {
  const [session, setSession] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [deviceLocations, setDeviceLocations] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
    }
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_, session) => setSession(session));

    const fetchData = async () => {
      const { data: locationLogs } = await supabase
        .from('logs')
        .select('device_key, location_data')
        .not('location_data', 'is', null)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (locationLogs) {
        const locations = locationLogs.map(log => ({
          device_id: log.device_key,
          latitude: log.location_data?.latitude || 0,
          longitude: log.location_data?.longitude || 0,
          city: log.location_data?.city || 'Unknown'
        }));
        setDeviceLocations(locations);
      }

      const { data: suspiciousLogs } = await supabase
        .from('logs')
        .select('*')
        .eq('is_suspicious', true)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (suspiciousLogs) {
        setSuspiciousActivity(suspiciousLogs.map(log => ({
          id: log.id,
          title: log.suspicious_reasons?.join(', ') || 'Suspicious activity',
          device_id: log.device_key,
          timestamp: new Date(log.timestamp).toLocaleString()
        })));
      }

      const { data: logs } = await supabase
        .from('logs')
        .select('timestamp')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (logs) {
        setAllLogs(logs);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {session ? (
        <div className="flex flex-col min-h-screen">
          <header className="bg-white dark:bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-indigo-600 dark:text-indigo-400 text-xl" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SilentAudit
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <nav className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1 rounded-md ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-1 rounded-md ${activeTab === 'analytics' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <FiPieChart className="inline mr-1" /> Analytics
                  </button>
                  <button
                    onClick={() => setActiveTab('export')}
                    className={`px-3 py-1 rounded-md ${activeTab === 'export' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <FiDownload className="inline mr-1" /> Export
                  </button>
                </nav>
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
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

          <main className="container mx-auto px-4 py-6 flex-1">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <IndiaMap locations={deviceLocations} />
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Security Alerts</h3>
                    <div className="space-y-3">
                      {suspiciousActivity.length > 0 ? (
                        suspiciousActivity.map(alert => (
                          <div key={alert.id} className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-start gap-3">
                            <FiAlertTriangle className="text-red-500 dark:text-red-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-red-800 dark:text-red-200">{alert.title}</p>
                              <p className="text-sm text-red-600 dark:text-red-300">{alert.device_id} • {alert.timestamp}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No security alerts detected</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Device Overview</h3>
                    {deviceLocations.length > 0 ? (
                      <div className="space-y-3">
                        <StatCard
                          title="Active Devices"
                          value={new Set(deviceLocations.map(l => l.device_id)).size}
                          icon={<FiActivity className="text-2xl" />}
                          color="indigo"
                        />
                        <StatCard
                          title="Cities"
                          value={new Set(deviceLocations.map(l => l.city)).size}
                          icon={<FiMapPin className="text-2xl" />}
                          color="emerald"
                        />
                        <StatCard
                          title="Avg. Work Hours"
                          value="6.2"
                          icon={<FiClock className="text-2xl" />}
                          color="amber"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No location data available.</p>
                    )}
                  </div>

                  <ProductivityScore />
                  <ActivityChart logs={allLogs} />
                </div>

                <div className="lg:col-span-3">
                  <SummaryStats />
                  <LogTable />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AppUsageChart />
                <WebsiteUsageChart />
                <div className="lg:col-span-2">
                  <ActivityChart logs={allLogs} />
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                <ExportReport />
                <CSVDownloader />
              </div>
            )}
          </main>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
