import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiShield, FiClock, FiMapPin } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';

const SEVERITY_COLORS = {
  high: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  medium: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
  low: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
};

const SEVERITY_ICONS = {
  high: <FiAlertTriangle className="text-red-500 dark:text-red-400 mt-1 flex-shrink-0" />,
  medium: <FiClock className="text-amber-500 dark:text-amber-400 mt-1 flex-shrink-0" />,
  low: <FiShield className="text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0" />
};

export default function SecurityAlerts() {
  const { fetchSuspiciousActivities, isLoading } = useData();
  const { showError } = useNotification();
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, high, medium, low
  
  useEffect(() => {
    loadAlerts();
  }, []);
  
  const loadAlerts = async () => {
    try {
      setLoading(true);
      const activities = await fetchSuspiciousActivities(20);
      
      // Enhance alerts with severity levels
      const enhancedAlerts = activities.map(alert => {
        // Determine severity based on alert title/content
        let severity = 'medium';
        
        if (alert.title.toLowerCase().includes('unauthorized') || 
            alert.title.toLowerCase().includes('suspicious login') ||
            alert.title.toLowerCase().includes('malware')) {
          severity = 'high';
        } else if (alert.title.toLowerCase().includes('unusual') ||
                  alert.title.toLowerCase().includes('warning')) {
          severity = 'medium';
        } else {
          severity = 'low';
        }
        
        return {
          ...alert,
          severity
        };
      });
      
      setAlerts(enhancedAlerts);
    } catch (err) {
      showError('Failed to load security alerts');
      console.error('Error loading security alerts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-200">Security Alerts</h3>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-2 py-1 text-xs rounded-md ${filter === 'all' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('high')} 
            className={`px-2 py-1 text-xs rounded-md ${filter === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            High
          </button>
          <button 
            onClick={() => setFilter('medium')} 
            className={`px-2 py-1 text-xs rounded-md ${filter === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Medium
          </button>
          <button 
            onClick={() => setFilter('low')} 
            className={`px-2 py-1 text-xs rounded-md ${filter === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            Low
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {loading || isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-3 rounded-lg flex items-start gap-3 ${SEVERITY_COLORS[alert.severity]}`}
            >
              {SEVERITY_ICONS[alert.severity]}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{alert.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    alert.severity === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                    alert.severity === 'medium' ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200' :
                    'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm flex items-center gap-1 mt-1">
                  <FiMapPin className="text-xs" /> {alert.device_id}
                </p>
                <p className="text-sm mt-1">{alert.timestamp}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {filter === 'all' 
              ? 'No security alerts detected' 
              : `No ${filter} severity alerts detected`}
          </p>
        )}
      </div>
    </div>
  );
} 