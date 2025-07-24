import React from 'react';

const LoadingFallback = ({ message = 'Loading application...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          This may take a few moments
        </p>
      </div>
    </div>
  );
};

export default LoadingFallback; 