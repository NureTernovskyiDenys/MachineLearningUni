import React from 'react';

const ProgressTracker = ({ statusObj }) => {
  if (!statusObj) return null;

  const { status, message, progress } = statusObj;

  const getStatusColor = () => {
    switch (status) {
      case 'Error': return 'bg-red-500';
      case 'Completed': return 'bg-green-500';
      default: return 'bg-indigo-500';
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700">{message}</span>
        <span className="text-sm font-bold text-gray-900">{typeof progress === 'number' ? `${progress}%` : ''}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ease-out ${getStatusColor()}`}
          style={{ width: `${progress || 0}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressTracker;
