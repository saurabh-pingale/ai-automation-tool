import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorPopupProps {
  message: string;
  duration?: number;
  onClose: () => void;
  type?: 'error' | 'warning' | 'success';
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({
  message,
  duration = 5000,
  onClose,
  type = 'error'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`flex items-center p-4 rounded-lg border shadow-lg max-w-md ${getStyles()} transition-all duration-300`}
      >
        <AlertCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${getIconColor()}`} />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};