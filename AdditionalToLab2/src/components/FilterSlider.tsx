import React from 'react';

interface FilterSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  onChange: (val: number) => void;
  // Visuals
  icon: React.ReactNode;
}

export const FilterSlider: React.FC<FilterSliderProps> = ({
  label, min, max, step, value, unit, onChange, icon
}) => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <div className="p-1.5 bg-slate-700 rounded-md text-blue-400">
            {icon}
          </div>
          {label}
        </div>
        <div className="text-slate-100 font-semibold text-lg">
          {value.toLocaleString()} <span className="text-sm font-normal text-slate-400">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
      />
      <div className="flex justify-between text-xs text-slate-500 font-medium px-1">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
};
