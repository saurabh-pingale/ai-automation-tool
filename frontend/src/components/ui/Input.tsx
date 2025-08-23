import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ id, label, error, className = '', ...rest }) => {
  const errorClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500';

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-3 bg-white border rounded-lg text-sm placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                    disabled:bg-gray-50 disabled:text-gray-500
                    transition-colors duration-200
                    ${errorClasses}`}
        {...rest}
      />
      {error && <p className="mt-2 text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>}
    </div>
  );
};