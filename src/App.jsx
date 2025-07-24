// App.jsx
import { useEffect, useState, Suspense } from 'react';
import LogTable from './LogTable';
import Login from './Login';
import StatCard from './components/StatCard';
import SummaryStats from './components/SummaryStats';
import CSVDownloader from './components/CSVDownloader';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { useNotification } from './context/NotificationContext';
import LoadingFallback from './components/LoadingFallback';

import {
  FiSun,
  FiMoon,
  FiMapPin,
  FiActivity,
  FiAlertTriangle,
  FiClock,
  FiPieChart,
  FiDownload,
  FiSettings
} from 'react-icons/fi';

import IndiaMap from './components/IndiaMap';
import ActivityChart from './components/ActivityChart';
import ProductivityScore from './components/ProductivityScore';
import AppUsageChart from './components/AppUsageChart';
import WebsiteUsageChart from './components/WebsiteUsageChart';
import ExportReport from './components/ExportReport';
import SecurityAlerts from './components/SecurityAlerts';
import DeviceManagement from './components/DeviceManagement';
import SystemHealth from './components/SystemHealth';
import NotificationsPanel from './components/NotificationsPanel';

function App() {
  const { session, user, signOut, loading: authLoading } = useAuth();
  const { 
    isLoading: dataLoading,
    error,
    fetchDeviceLocations,
    fetchSuspiciousActivities,
    subscribeToLogs
  } = useData();
  const { showError } = useNotification();
  
  const [isDark, setIsDark] = useState(false);
  const [deviceLocations, setDeviceLocations] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [initError, setInitError] = useState(null);

  // Theme handling
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDark(true);
      }
    } catch (err) {
      console.warn('Error accessing localStorage:', err);
    }
  }, []);

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (err) {
      console.warn('Error accessing localStorage:', err);
    }
  }, [isDark]);

  // Data fetching
  useEffect(() => {
    if (!session) return;
    
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setInitError(null);
        
        // Fetch device locations
        const locations = await fetchDeviceLocations(100);
        setDeviceLocations(locations || []);
        
        // Fetch suspicious activities
        const activities = await fetchSuspiciousActivities(10);
        setSuspiciousActivity(activities || []);
        
        // Subscribe to real-time updates
        const unsubscribe = subscribeToLogs((payload) => {
          // Refresh data when new logs come in
          loadDashboardData().catch(console.error);
        });
        
        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (err) {
        console.error('Dashboard data error:', err);
        setInitError('Failed to load dashboard data. Please try refreshing the page.');
        showError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData().catch(err => {
      console.error('Error in loadDashboardData:', err);
      setInitError('Failed to initialize dashboard. Please try refreshing the page.');
    });
  }, [session, fetchDeviceLocations, fetchSuspiciousActivities, subscribeToLogs, showError]);

  // Error handling
  useEffect(() => {
    if (error) {
      showError(error.message || 'An unexpected error occurred');
    }
  }, [error, showError]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      showError('Failed to sign out');
      console.error('Sign out error:', err);
    }
  };

  // If authentication is still loading, show loading screen
  if (authLoading) {
    return <LoadingFallback message="Authenticating..." />;
  }

  // If not authenticated, show login screen
  if (!session) {
    return <Login />;
  }

  // If there's an initialization error, show it
  if (initError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-lg w-full text-center">
          <FiAlertTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
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
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1 rounded-md ${activeTab === 'settings' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <FiSettings className="inline mr-1" /> Settings
                </button>
              </nav>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
                </button>
                <NotificationsPanel />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.email}
                </span>
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium hover:shadow-md transition-all"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 flex-1">
          {isLoading || dataLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <Suspense fallback={<LoadingFallback message="Loading content..." />}>
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <IndiaMap locations={deviceLocations} />
                    <SecurityAlerts />
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
                  <div className="lg:col-span-2">
                    <SystemHealth />
                  </div>
                </div>
              )}

              {activeTab === 'export' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                  <ExportReport />
                  <CSVDownloader />
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-6">Settings</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">User Profile</h3>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="mb-1"><strong>Email:</strong> {user?.email}</p>
                          <p><strong>User ID:</strong> {user?.id}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Appearance</h3>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setIsDark(false)}
                            className={`px-4 py-2 rounded-lg ${!isDark ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 dark:bg-gray-700'}`}
                          >
                            <FiSun className="inline mr-2" /> Light Mode
                          </button>
                          <button
                            onClick={() => setIsDark(true)}
                            className={`px-4 py-2 rounded-lg ${isDark ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'bg-gray-100 dark:bg-gray-700'}`}
                          >
                            <FiMoon className="inline mr-2" /> Dark Mode
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Account</h3>
                        <button
                          onClick={handleSignOut}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <DeviceManagement />
                  </div>
                </div>
              )}
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
