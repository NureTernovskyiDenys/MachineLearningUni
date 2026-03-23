import { Play, Square, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  dataset: 'linear' | 'xor';
  setDataset: (d: 'linear' | 'xor') => void;
  network: 'SLP' | 'MLP';
  setNetwork: (n: 'SLP' | 'MLP') => void;
  learningRate: number;
  setLearningRate: (lr: number) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  dataset, setDataset, network, setNetwork, learningRate, setLearningRate,
  isRunning, onStart, onStop, onReset
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
      <h2 className="text-lg font-semibold dark:text-zinc-100">Controls</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Dataset</label>
          <div className="flex gap-2">
            <button
              disabled={isRunning}
              onClick={() => setDataset('linear')}
              className={`flex-1 py-1 px-3 rounded-md text-sm transition-colors border ${dataset === 'linear' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 opacity-60'}`}
            >Linear</button>
            <button
              disabled={isRunning}
              onClick={() => setDataset('xor')}
              className={`flex-1 py-1 px-3 rounded-md text-sm transition-colors border ${dataset === 'xor' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 opacity-60'}`}
            >XOR</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Architecture</label>
          <div className="flex gap-2">
            <button
              disabled={isRunning}
              onClick={() => setNetwork('SLP')}
              className={`flex-1 py-1 px-3 rounded-md text-sm transition-colors border ${network === 'SLP' ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 opacity-60'}`}
            >SLP</button>
            <button
              disabled={isRunning}
              onClick={() => setNetwork('MLP')}
              className={`flex-1 py-1 px-3 rounded-md text-sm transition-colors border ${network === 'MLP' ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 opacity-60'}`}
            >MLP</button>
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 flex justify-between">
             Learning Rate (r) <span>{learningRate.toFixed(3)}</span>
           </label>
           <input 
             type="range" 
             min="0.001" 
             max="0.5" 
             step="0.001"
             value={learningRate} 
             onChange={(e) => setLearningRate(parseFloat(e.target.value))}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-indigo-600"
             disabled={isRunning}
           />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
        {!isRunning ? (
          <button onClick={onStart} className="col-span-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            <Play size={16} fill="currentColor" /> Start
          </button>
        ) : (
          <button onClick={onStop} className="col-span-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
            <Square size={16} fill="currentColor" /> Stop
          </button>
        )}
        <button onClick={onReset} className="col-span-1 flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-2 px-4 rounded-lg transition-colors font-medium">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
};
