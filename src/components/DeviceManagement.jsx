import { useState, useEffect } from 'react';
import { FiMonitor, FiTrash2, FiEdit, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';

export default function DeviceManagement() {
  const { fetchDeviceIds, isLoading: dataLoading } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDevice, setEditingDevice] = useState(null);
  const [editName, setEditName] = useState('');
  
  useEffect(() => {
    loadDevices();
  }, []);
  
  const loadDevices = async () => {
    try {
      setLoading(true);
      const deviceIds = await fetchDeviceIds();
      
      // Create enhanced device objects with additional info
      const enhancedDevices = deviceIds.map(id => ({
        id,
        name: getDeviceName(id),
        status: getRandomStatus(),
        lastActive: getRandomDate(),
        type: getDeviceType(id)
      }));
      
      setDevices(enhancedDevices);
    } catch (err) {
      showError('Failed to load devices');
      console.error('Error loading devices:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions to generate mock data
  const getDeviceName = (id) => {
    const prefixes = ['Work', 'Home', 'Office', 'Personal'];
    const types = ['Laptop', 'Desktop', 'MacBook', 'PC'];
    
    // Generate a deterministic name based on the device ID
    const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prefix = prefixes[hash % prefixes.length];
    const type = types[(hash * 13) % types.length];
    
    return `${prefix} ${type}`;
  };
  
  const getDeviceType = (id) => {
    const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 3 === 0 ? 'desktop' : 'laptop';
  };
  
  const getRandomStatus = () => {
    const statuses = ['active', 'inactive', 'suspended'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };
  
  const getRandomDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 14); // Random date within last 2 weeks
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };
  
  const handleEdit = (device) => {
    setEditingDevice(device.id);
    setEditName(device.name);
  };
  
  const handleSave = (deviceId) => {
    if (editName.trim() === '') {
      showError('Device name cannot be empty');
      return;
    }
    
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceId 
          ? { ...device, name: editName.trim() } 
          : device
      )
    );
    
    setEditingDevice(null);
    showSuccess('Device name updated');
  };
  
  const handleCancel = () => {
    setEditingDevice(null);
  };
  
  const handleDelete = (deviceId) => {
    // In a real app, this would call an API to delete the device
    if (window.confirm('Are you sure you want to remove this device?')) {
      setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
      showSuccess('Device removed successfully');
    }
  };
  
  const filteredDevices = searchQuery 
    ? devices.filter(device => 
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : devices;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6">Device Management</h2>
      
      <div className="mb-6">
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>
      
      {loading || dataLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredDevices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2">Device</th>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Active</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map(device => (
                <tr key={device.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    {editingDevice === device.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <FiMonitor className="text-indigo-500" />
                        <span>{device.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{device.id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(device.status)}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(device.lastActive)}</td>
                  <td className="px-4 py-3">
                    {editingDevice === device.id ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSave(device.id)}
                          className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400"
                        >
                          <FiCheck />
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(device)}
                          className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(device.id)}
                          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-10 text-muted-foreground">
          {searchQuery ? 'No devices match your search' : 'No devices found'}
        </p>
      )}
    </div>
  );
} 