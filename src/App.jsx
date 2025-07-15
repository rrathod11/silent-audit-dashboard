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
  FiDownload,
  FiSearch,
  FiFilter,
  FiHardDrive,
  FiGlobe,
  FiShield,
  FiChevronLeft,
  FiChevronRight
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    device_id: '',
    date_range: '',
    risk_level: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showBrowserHistory, setShowBrowserHistory] = useState(false);
  const [browserHistory, setBrowserHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Risk level badges configuration
  const riskLevels = {
    high: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <FiAlertTriangle className="inline mr-1" /> },
    medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <FiAlertTriangle className="inline mr-1" /> },
    low: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <FiShield className="inline mr-1" /> },
    normal: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <FiShield className="inline mr-1" /> }
  };

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

  const fetchData = async () => {
    const { data: locationLogs } = await supabase
      .from('logs')
      .select('device_key, location_data, device_info')
      .not('location_data', 'is', null)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (locationLogs) {
      const locations = locationLogs.map(log => ({
        device_key: log.device_key,
        latitude: log.location_data?.latitude || 0,
        longitude: log.location_data?.longitude || 0,
        city: log.location_data?.city || 'Unknown',
        device_info: log.device_info || {}
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
        device_id: log.device_id,
        timestamp: new Date(log.timestamp).toLocaleString(),
        risk_level: determineRiskLevel(log)
      })));
    }

    const { data: logs } = await supabase
      .from('logs')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (logs) {
      setAllLogs(logs);
    }
  };

  const determineRiskLevel = (log) => {
    if (log.is_suspicious) {
      const reasons = log.suspicious_reasons || [];
      if (reasons.some(r => r.includes('malware') || r.includes('unauthorized'))) {
        return 'high';
      }
      return 'medium';
    }
    return log.risk_assessment === 'low' ? 'low' : 'normal';
  };

  const fetchBrowserHistory = async (deviceId) => {
    const { data } = await supabase
      .from('logs')
      .select('browser_history')
      .eq('device_id', deviceId)
      .not('browser_history', 'is', null)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (data && data.length > 0) {
      setBrowserHistory(data[0].browser_history || []);
    } else {
      setBrowserHistory([]);
    }
    setShowBrowserHistory(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const filteredLogs = allLogs.filter(log => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      log.device_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location_data?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.suspicious_reasons?.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Device ID filter
    const matchesDevice = filters.device_id === '' || 
      log.device_id?.toLowerCase().includes(filters.device_id.toLowerCase());
    
    // Date range filter (simplified)
    const matchesDate = filters.date_range === '' || 
      (filters.date_range === 'today' && new Date(log.timestamp).toDateString() === new Date().toDateString()) ||
      (filters.date_range === 'week' && new Date(log.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filters.date_range === 'month' && new Date(log.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    // Risk level filter
    const logRisk = determineRiskLevel(log);
    const matchesRisk = filters.risk_level === '' || 
      logRisk === filters.risk_level;
    
    return matchesSearch && matchesDevice && matchesDate && matchesRisk;
  });

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Device ID', 'Location', 'Activity', 'Risk Level', 'Suspicious Reasons'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.device_id,
        log.location_data?.city || 'Unknown',
        log.activity_type || 'Unknown',
        determineRiskLevel(log),
        log.suspicious_reasons?.join('; ') || ''
      ].map(field => `"${field?.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `silentaudit_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_, session) => setSession(session));

    fetchData(); // Initial fetch

    const interval = setInterval(() => {
      fetchData(); // Refresh every 30 seconds
    }, 30000);

    return () => clearInterval(interval); // Cleanup
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
                              <p className="text-sm text-red-600 dark:text-red-300">
                                {alert.device_id} • {alert.timestamp}
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${riskLevels[alert.risk_level]?.color || riskLevels.normal.color}`}>
                                  {riskLevels[alert.risk_level]?.icon || riskLevels.normal.icon}
                                  {alert.risk_level}
                                </span>
                              </p>
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
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200">Activity Logs</h3>
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search logs..."
                            className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={searchQuery}
                            onChange={handleSearch}
                          />
                        </div>
                        <div className="flex gap-2">
                          <select
                            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={filters.device_id}
                            onChange={(e) => handleFilterChange('device_id', e.target.value)}
                          >
                            <option value="">All Devices</option>
                            {Array.from(new Set(allLogs.map(log => log.device_id))).map(id => (
                              <option key={id} value={id}>{id}</option>
                            ))}
                          </select>
                          <select
                            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={filters.date_range}
                            onChange={(e) => handleFilterChange('date_range', e.target.value)}
                          >
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                          </select>
                          <select
                            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={filters.risk_level}
                            onChange={(e) => handleFilterChange('risk_level', e.target.value)}
                          >
                            <option value="">All Risk Levels</option>
                            <option value="high">High Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="low">Low Risk</option>
                            <option value="normal">Normal</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <LogTable 
                      logs={currentLogs} 
                      onRowClick={(log) => {
                        setSelectedLog(log);
                        setShowSystemInfo(true);
                      }}
                      onBrowserHistoryClick={fetchBrowserHistory}
                      riskLevels={riskLevels}
                    />
                    
                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
                        >
                          <FiChevronLeft />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => paginate(pageNum)}
                              className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'bg-gray-100 dark:bg-gray-700'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  </div>
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <ExportReport 
                  logs={filteredLogs} 
                  onExportCSV={exportToCSV}
                  riskLevels={riskLevels}
                />
              </div>
            )}
          </main>

          {/* System Info Drawer */}
          {showSystemInfo && selectedLog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
              <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">System Information</h3>
                  <button 
                    onClick={() => setShowSystemInfo(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Device Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Device ID</p>
                        <p className="text-gray-800 dark:text-white">{selectedLog.device_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">IP Address</p>
                        <p className="text-gray-800 dark:text-white">{selectedLog.ip_address || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">OS</p>
                        <p className="text-gray-800 dark:text-white">{selectedLog.device_info?.os || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Browser</p>
                        <p className="text-gray-800 dark:text-white">{selectedLog.device_info?.browser || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Location</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                        <p className="text-gray-800 dark:text-white">{selectedLog.location_data?.city || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                        <p className="text-gray-800 dark:text-white">{selectedLog.location_data?.country || 'Unknown'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Coordinates</p>
                        <p className="text-gray-800 dark:text-white">
                          {selectedLog.location_data?.latitude ? `${selectedLog.location_data.latitude}, ${selectedLog.location_data.longitude}` : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedLog.screenshot_url && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Screenshot</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={selectedLog.screenshot_url} 
                          alt="Device screenshot" 
                          className="w-full h-auto"
                          onClick={() => window.open(selectedLog.screenshot_url, '_blank')}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Details</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Timestamp</p>
                        <p className="text-gray-800 dark:text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Activity Type</p>
                        <p className="text-gray-800 dark:text-white">{selectedLog.activity_type || 'Unknown'}</p>
                      </div>
                      {selectedLog.is_suspicious && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Suspicious Reasons</p>
                          <p className="text-gray-800 dark:text-white">{selectedLog.suspicious_reasons?.join(', ') || 'Unknown'}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Risk Level</p>
                        <span className={`px-2 py-1 rounded-full text-sm ${riskLevels[determineRiskLevel(selectedLog)]?.color || riskLevels.normal.color}`}>
                          {riskLevels[determineRiskLevel(selectedLog)]?.icon || riskLevels.normal.icon}
                          {determineRiskLevel(selectedLog)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => fetchBrowserHistory(selectedLog.device_id)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 rounded-lg"
                  >
                    <FiGlobe /> View Browser History
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Browser History Modal */}
          {showBrowserHistory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Browser History</h3>
                  <button 
                    onClick={() => setShowBrowserHistory(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="p-4 overflow-y-auto max-h-[70vh]">
                  {browserHistory.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-2 text-gray-700 dark:text-gray-300">Title</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-300">URL</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-300">Visits</th>
                          <th className="text-left py-2 text-gray-700 dark:text-gray-300">Last Visit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {browserHistory.map((item, index) => (
                          <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-2 text-gray-800 dark:text-gray-200 truncate max-w-xs">{item.title}</td>
                            <td className="py-2 text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs">
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                {item.url}
                              </a>
                            </td>
                            <td className="py-2 text-gray-800 dark:text-gray-200">{item.visitCount}</td>
                            <td className="py-2 text-gray-800 dark:text-gray-200">
                              {new Date(item.lastVisitTime).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No browser history available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
