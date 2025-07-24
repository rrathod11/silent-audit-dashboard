import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const VARIANTS = {
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    className: 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200',
    iconClassName: 'text-green-500 dark:text-green-400'
  },
  error: {
    icon: <AlertCircle className="h-5 w-5" />,
    className: 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200',
    iconClassName: 'text-red-500 dark:text-red-400'
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    className: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    iconClassName: 'text-blue-500 dark:text-blue-400'
  }
};

export default function Toast({ 
  message, 
  variant = 'info', 
  duration = 5000, 
  onClose 
}) {
  const [visible, setVisible] = useState(true);
  const { icon, className, iconClassName } = VARIANTS[variant] || VARIANTS.info;

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    
    if (duration) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300); // Allow animation to complete
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message || !visible) return null;

  const handleClose = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300); // Allow animation to complete
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg p-4 shadow-lg transition-all ${className} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      role="alert"
    >
      <div className={`flex-shrink-0 ${iconClassName}`}>
        {icon}
      </div>
      <div className="flex-1">{message}</div>
      <button 
        onClick={handleClose} 
        className="flex-shrink-0 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
} 