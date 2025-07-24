import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiX, FiAlertTriangle, FiInfo, FiSettings } from 'react-icons/fi';
import { useNotification } from '../context/NotificationContext';

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'System Update Available',
    message: 'A new system update (v2.1.0) is available for installation.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    type: 'info',
    read: false
  },
  {
    id: 2,
    title: 'Suspicious Login Detected',
    message: 'Unusual login detected from IP 192.168.1.45 in New York.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: 'warning',
    read: false
  },
  {
    id: 3,
    title: 'Disk Space Low',
    message: 'Your system is running low on disk space (15% remaining).',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    type: 'error',
    read: true
  },
  {
    id: 4,
    title: 'Backup Completed',
    message: 'Weekly system backup completed successfully.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    type: 'success',
    read: true
  },
  {
    id: 5,
    title: 'New Device Connected',
    message: 'A new device "iPhone 13" has connected to your account.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    type: 'info',
    read: true
  }
];

export default function NotificationsPanel() {
  const { showSuccess } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
  const loadNotifications = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
    }, 500);
  };
  
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    showSuccess('All notifications marked as read');
  };
  
  const deleteNotification = (id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  const clearAllNotifications = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
      showSuccess('All notifications cleared');
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FiAlertTriangle className="text-amber-500" />;
      case 'error':
        return <FiAlertTriangle className="text-red-500" />;
      case 'success':
        return <FiCheck className="text-green-500" />;
      case 'info':
      default:
        return <FiInfo className="text-blue-500" />;
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.read) 
      : notifications.filter(n => n.read);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="relative">
      {/* Notification Bell */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full relative hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Notifications"
      >
        <FiBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
          <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-2 py-1 text-xs rounded ${filter === 'all' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : ''}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`px-2 py-1 text-xs rounded ${filter === 'unread' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : ''}`}
              >
                Unread
              </button>
              <button 
                onClick={() => setFilter('read')}
                className={`px-2 py-1 text-xs rounded ${filter === 'read' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : ''}`}
              >
                Read
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No notifications found
              </div>
            )}
          </div>
          
          <div className="p-3 border-t dark:border-gray-700 flex justify-between">
            <button 
              onClick={markAllAsRead}
              disabled={!notifications.some(n => !n.read)}
              className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 disabled:opacity-50"
            >
              <FiCheck className="inline mr-1" /> Mark all as read
            </button>
            <button 
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
              className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 disabled:opacity-50"
            >
              <FiTrash2 className="inline mr-1" /> Clear all
            </button>
          </div>
          
          <div className="p-2 border-t dark:border-gray-700 flex justify-center">
            <button className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FiSettings className="inline" /> Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 