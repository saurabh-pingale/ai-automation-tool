import React, { createContext, useContext, useState, useCallback } from 'react';
import { ErrorPopup } from '../components/ui/ErrorPopup';

interface ErrorContextType {
  showError: (message: string, type?: 'error' | 'warning' | 'success', duration?: number) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorState {
  id: number;
  message: string;
  type: 'error' | 'warning' | 'success';
  duration?: number;
}

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorState[]>([]);

  const showError = useCallback((message: string, type: 'error' | 'warning' | 'success' = 'error', duration?: number) => {
    const id = Date.now();
    setErrors(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeError = useCallback((id: number) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {errors.map((error) => (
        <ErrorPopup
          key={error.id}
          message={error.message}
          type={error.type}
          duration={error.duration}
          onClose={() => removeError(error.id)}
        />
      ))}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};