import React from 'react';

const Grid = ({ pattern, onTogglePixel, isRecognizing }) => {
  return (
    <div className="grid grid-cols-10 gap-1 bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-2xl">
      {pattern.map((val, index) => {
        const isFilled = val === 1;
        return (
          <div
            key={index}
            onClick={() => {
              if (!isRecognizing) onTogglePixel(index);
            }}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-sm cursor-pointer border 
              pixel-cell
              ${isFilled ? 'pixel-filled' : 'pixel-empty'}
              ${isRecognizing ? 'cursor-not-allowed opacity-80' : 'hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50'}
            `}
          />
        );
      })}
    </div>
  );
};

export default Grid;
