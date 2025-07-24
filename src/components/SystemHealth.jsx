import { useState, useEffect } from 'react';
import { FiCpu, FiHardDrive, FiServer, FiActivity } from 'react-icons/fi';
import { useNotification } from '../context/NotificationContext';

// Mock data for system health metrics
const MOCK_METRICS = {
  cpu: {
    usage: 42,
    temperature: 65,
    cores: 8
  },
  memory: {
    total: 16384,
    used: 8192,
    free: 8192
  },
  disk: {
    total: 512000,
    used: 256000,
    free: 256000
  },
  network: {
    upload: 1.2,
    download: 5.6,
    latency: 45
  },
  uptime: 15 * 24 * 60 * 60 // 15 days in seconds
};

export default function SystemHealth() {
  const { showError } = useNotification();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  useEffect(() => {
    fetchMetrics();
    
    const intervalId = setInterval(() => {
      fetchMetrics();
    }, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  const fetchMetrics = () => {
    // In a real app, this would fetch data from an API
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Add some random variation to the mock data
        const variation = (base) => base * (0.95 + Math.random() * 0.1);
        
        const updatedMetrics = {
          cpu: {
            usage: Math.min(100, Math.round(variation(MOCK_METRICS.cpu.usage))),
            temperature: Math.round(variation(MOCK_METRICS.cpu.temperature)),
            cores: MOCK_METRICS.cpu.cores
          },
          memory: {
            total: MOCK_METRICS.memory.total,
            used: Math.round(variation(MOCK_METRICS.memory.used)),
            free: MOCK_METRICS.memory.total - Math.round(variation(MOCK_METRICS.memory.used))
          },
          disk: {
            total: MOCK_METRICS.disk.total,
            used: Math.round(variation(MOCK_METRICS.disk.used)),
            free: MOCK_METRICS.disk.total - Math.round(variation(MOCK_METRICS.disk.used))
          },
          network: {
            upload: parseFloat(variation(MOCK_METRICS.network.upload).toFixed(1)),
            download: parseFloat(variation(MOCK_METRICS.network.download).toFixed(1)),
            latency: Math.round(variation(MOCK_METRICS.network.latency))
          },
          uptime: MOCK_METRICS.uptime + refreshInterval
        };
        
        setMetrics(updatedMetrics);
        setLoading(false);
      } catch (err) {
        showError('Failed to fetch system metrics');
        console.error('Error fetching metrics:', err);
        setLoading(false);
      }
    }, 1000); // Simulate 1 second API delay
  };
  
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };
  
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };
  
  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'text-green-500';
    if (percentage < 80) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const getTemperatureColor = (temp) => {
    if (temp < 60) return 'text-green-500';
    if (temp < 80) return 'text-amber-500';
    return 'text-red-500';
  };
  
  if (!metrics && loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">System Health</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">System Health</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Refresh every:</span>
          <select 
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded p-1"
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
          </select>
          <button 
            onClick={fetchMetrics}
            className="p-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 text-sm"
            disabled={loading}
          >
            Refresh Now
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU */}
        <div className="border rounded-lg p-4 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <FiCpu className="text-indigo-500" />
            <h3 className="font-medium">CPU</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Usage</span>
                <span className={getUsageColor(metrics?.cpu.usage || 0)}>{metrics?.cpu.usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${
                    metrics?.cpu.usage < 50 ? 'bg-green-500' :
                    metrics?.cpu.usage < 80 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics?.cpu.usage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Temperature</span>
              <span className={getTemperatureColor(metrics?.cpu.temperature || 0)}>
                {metrics?.cpu.temperature}°C
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Cores</span>
              <span>{metrics?.cpu.cores}</span>
            </div>
          </div>
        </div>
        
        {/* Memory */}
        <div className="border rounded-lg p-4 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <FiServer className="text-emerald-500" />
            <h3 className="font-medium">Memory</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Usage</span>
                <span className={getUsageColor((metrics?.memory.used / metrics?.memory.total) * 100 || 0)}>
                  {Math.round((metrics?.memory.used / metrics?.memory.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${
                    (metrics?.memory.used / metrics?.memory.total) * 100 < 50 ? 'bg-green-500' :
                    (metrics?.memory.used / metrics?.memory.total) * 100 < 80 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(metrics?.memory.used / metrics?.memory.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>{formatBytes(metrics?.memory.used * 1024 * 1024)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Free</span>
              <span>{formatBytes(metrics?.memory.free * 1024 * 1024)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span>{formatBytes(metrics?.memory.total * 1024 * 1024)}</span>
            </div>
          </div>
        </div>
        
        {/* Disk */}
        <div className="border rounded-lg p-4 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <FiHardDrive className="text-purple-500" />
            <h3 className="font-medium">Storage</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Usage</span>
                <span className={getUsageColor((metrics?.disk.used / metrics?.disk.total) * 100 || 0)}>
                  {Math.round((metrics?.disk.used / metrics?.disk.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full ${
                    (metrics?.disk.used / metrics?.disk.total) * 100 < 50 ? 'bg-green-500' :
                    (metrics?.disk.used / metrics?.disk.total) * 100 < 80 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(metrics?.disk.used / metrics?.disk.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>{formatBytes(metrics?.disk.used * 1024 * 1024)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Free</span>
              <span>{formatBytes(metrics?.disk.free * 1024 * 1024)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span>{formatBytes(metrics?.disk.total * 1024 * 1024)}</span>
            </div>
          </div>
        </div>
        
        {/* Network & Uptime */}
        <div className="border rounded-lg p-4 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <FiActivity className="text-blue-500" />
            <h3 className="font-medium">Network & Uptime</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Upload</span>
              <span>{metrics?.network.upload} MB/s</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Download</span>
              <span>{metrics?.network.download} MB/s</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Latency</span>
              <span>{metrics?.network.latency} ms</span>
            </div>
            
            <div className="border-t dark:border-gray-700 pt-3 mt-3">
              <div className="flex justify-between text-sm">
                <span>System Uptime</span>
                <span>{formatUptime(metrics?.uptime)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 