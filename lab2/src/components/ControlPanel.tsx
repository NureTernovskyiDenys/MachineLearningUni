import React from 'react';
import type { NetworkConfig } from '../lib/network';

interface ControlPanelProps {
  config: NetworkConfig;
  setConfig: React.Dispatch<React.SetStateAction<NetworkConfig>>;
  noiseLevel: number;
  setNoiseLevel: (v: number) => void;
  samplesPerClass: number;
  setSamplesPerClass: (v: number) => void;
  onTrain: () => void;
  isTraining: boolean;
}

export default function ControlPanel({
  config,
  setConfig,
  noiseLevel,
  setNoiseLevel,
  samplesPerClass,
  setSamplesPerClass,
  onTrain,
  isTraining,
}: ControlPanelProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-4 border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-2">Controls</h2>
      
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Algorithm</label>
        <select
          name="algorithm"
          value={config.algorithm}
          onChange={handleChange}
          disabled={isTraining}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="WTA">WTA (Winner Takes All)</option>
          <option value="SOM">Kohonen Map (SOM)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">Initial Learning Rate r(0)</label>
          <span className="text-xs text-slate-500">{config.initialLearningRate.toFixed(2)}</span>
        </div>
        <input
          type="range"
          name="initialLearningRate"
          min="0.01"
          max="1.0"
          step="0.01"
          value={config.initialLearningRate}
          onChange={handleChange}
          disabled={isTraining}
          className="w-full accent-blue-600"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Epochs</label>
        <input
          type="number"
          name="epochs"
          min="10"
          max="5000"
          value={config.epochs}
          onChange={handleChange}
          disabled={isTraining}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Number of Neurons</label>
        <input
          type="number"
          name="numNeurons"
          min="5"
          max="50"
          value={config.numNeurons}
          onChange={handleChange}
          disabled={isTraining}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {config.algorithm === 'SOM' && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Initial Radius NE(0)</label>
          <input
            type="number"
            name="initialRadius"
            min="1"
            max={Math.floor(config.numNeurons / 2)}
            value={config.initialRadius}
            onChange={handleChange}
            disabled={isTraining}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="border-t my-2 border-slate-100"></div>
      
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">Dataset Noise</label>
          <span className="text-xs text-slate-500">{(noiseLevel * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="0.2"
          step="0.01"
          value={noiseLevel}
          onChange={(e) => setNoiseLevel(Number(e.target.value))}
          disabled={isTraining}
          className="w-full accent-green-600"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Samples per Class</label>
        <input
          type="number"
          min="5"
          max="100"
          value={samplesPerClass}
          onChange={(e) => setSamplesPerClass(Number(e.target.value))}
          disabled={isTraining}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <button
        onClick={onTrain}
        disabled={isTraining}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
      >
        {isTraining ? 'Training...' : 'Start Training'}
      </button>

    </div>
  );
}
