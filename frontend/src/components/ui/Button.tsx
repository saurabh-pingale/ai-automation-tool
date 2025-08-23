import React from 'react';
import { Spinner } from './Spinner';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
};

export const Button = ({ children, className, variant = 'primary', isLoading = false, ...props }: ButtonProps) => {
  const baseStyles = 'px-4 py-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center';
  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-gray-200',
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${isLoading ? 'opacity-70' : ''}`} 
      {...props} 
      disabled={isLoading || props.disabled}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};