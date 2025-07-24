import { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = ({ message, variant = 'info', duration = 5000 }) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, variant, duration }]);
    return id;
  };

  const showSuccess = (message, duration) => {
    return showNotification({ message, variant: 'success', duration });
  };

  const showError = (message, duration) => {
    return showNotification({ message, variant: 'error', duration });
  };

  const showInfo = (message, duration) => {
    return showNotification({ message, variant: 'info', duration });
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const value = {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          message={notification.message}
          variant={notification.variant}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 