import React from 'react';
import type { LaptopParsed, IdealState } from '../types';
import { Monitor, Cpu, MemoryStick, Weight, IndianRupee } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface LaptopCardProps {
  laptop: LaptopParsed;
  ideal: IdealState;
}

export const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, ideal }) => {
  // Highlight parameters in red/green if they deviate by more than 20% of their actual value vs ideal
  // Green if better than ideal (e.g., lower price, higher ram, lower weight, higher cpu)
  // Red if worse than ideal (e.g. higher price, lower ram, higher weight, lower cpu)
  
  const getDiffColor = (val: number, target: number, isMoreBetter: boolean) => {
    const diff = (val - target) / (target || 1);
    const threshold = 0.15; // 15% diff constitutes a noticeable highlight
    
    if (Math.abs(diff) < threshold) return "text-slate-300"; // Neutral
    
    if (isMoreBetter) {
      return diff > 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold";
    } else {
      // For price and weight, less is better
      return diff < 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold";
    }
  };

  return (
    <div className="flex flex-col bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg hover:shadow-xl hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-700 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{laptop.company}</span>
            <h3 className="text-lg font-bold text-slate-100 leading-tight mt-1 line-clamp-1 truncate" title={laptop.product}>{laptop.product}</h3>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-slate-500 uppercase">Match Score</span>
            <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md text-sm font-bold border border-blue-500/30">
              {laptop.similarityScore?.toFixed(1)}%
            </div>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-400 mt-1">{laptop.typeName}</p>
      </div>

      {/* Body Specs */}
      <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400"><IndianRupee size={18} /></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Price</span>
            <span className={twMerge("text-sm", getDiffColor(laptop.price, ideal.price, false))}>
              ₹{laptop.price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400"><MemoryStick size={18} /></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">RAM</span>
            <span className={twMerge("text-sm", getDiffColor(laptop.ram, ideal.ram, true))}>
              {laptop.ram} GB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400"><Cpu size={18} /></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">CPU Freq.</span>
            <span className={twMerge("text-sm", getDiffColor(laptop.cpuFreq, ideal.cpuFreq, true))}>
              {laptop.cpuFreq} GHz
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400"><Weight size={18} /></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Weight</span>
            <span className={twMerge("text-sm", getDiffColor(laptop.weight, ideal.weight, false))}>
              {laptop.weight} kg
            </span>
          </div>
        </div>
        
        {/* Full width screen info */}
        <div className="col-span-2 flex items-center gap-3 mt-1 pt-4 border-t border-slate-700/50">
          <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400"><Monitor size={18} /></div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Display</span>
            <span className="text-sm text-slate-300 truncate" title={laptop.screenResolution}>
              {laptop.screenResolution}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
