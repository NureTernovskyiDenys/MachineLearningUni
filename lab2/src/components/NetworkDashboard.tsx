import { useState, useEffect, useRef } from 'react';
import ControlPanel from './ControlPanel';
import HeatmapVisualization from './HeatmapVisualization';
import AnalyticsTab from './AnalyticsTab';
import { generateDataset, FEATURE_NAMES } from '../lib/dataset';
import type { DataPoint } from '../lib/dataset';
import { KohonenNetwork } from '../lib/network';
import type { NetworkConfig } from '../lib/network';

export default function NetworkDashboard() {
  const [activeTab, setActiveTab] = useState<'train' | 'analytics'>('train');

  // Network Configuration State
  const [config, setConfig] = useState<NetworkConfig>({
    numNeurons: 10,
    numFeatures: 10,
    initialLearningRate: 0.5,
    epochs: 100,
    algorithm: 'SOM',
    initialRadius: 4,
  });

  const [noiseLevel, setNoiseLevel] = useState<number>(0.05); // 5% by default
  const [samplesPerClass, setSamplesPerClass] = useState<number>(20);

  // Training State
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [history, setHistory] = useState<number[][][]>([]);
  const [dataset, setDataset] = useState<DataPoint[]>([]);

  // Simulation ref for animation
  const animRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Generate initial dataset
    const initialData = generateDataset(samplesPerClass, noiseLevel);
    setDataset(initialData);
  }, [samplesPerClass, noiseLevel]);

  const handleTrain = () => {
    if (dataset.length === 0) return;

    setIsTraining(true);
    setCurrentEpoch(0);
    setHistory([]);

    const network = new KohonenNetwork(config);
    const numericDataset = dataset.map(d => d.features);

    // Run full training synchronously to get history, UI will animate it
    const { history: newHistory } = network.train(numericDataset);
    setHistory(newHistory);
    setCurrentEpoch(0);
  };

  useEffect(() => {
    if (isTraining && history.length > 0) {
      if (currentEpoch < history.length - 1) {
        animRef.current = requestAnimationFrame(() => {
          // throttle animation speed
          setTimeout(() => setCurrentEpoch(prev => prev + 1), 30);
        });
      } else {
        setIsTraining(false);
      }
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isTraining, currentEpoch, history]);
  
  const currentWeights = history.length > 0 ? history[currentEpoch] : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex bg-white rounded-lg shadow p-1 w-fit">
        <button
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'train' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('train')}
        >
          Training Visualization
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          onClick={() => setActiveTab('analytics')}
        >
          Research & Analytics
        </button>
      </div>

      {activeTab === 'train' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ControlPanel
              config={config}
              setConfig={setConfig}
              noiseLevel={noiseLevel}
              setNoiseLevel={setNoiseLevel}
              samplesPerClass={samplesPerClass}
              setSamplesPerClass={setSamplesPerClass}
              onTrain={handleTrain}
              isTraining={isTraining}
            />
          </div>
          <div className="lg:col-span-3 bg-white rounded-xl shadow p-6 flex flex-col items-center border border-slate-100 h-full min-h-[500px]">
             
            <div className="w-full flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Neuron Weights Heatmap</h2>
              <div className="bg-slate-100 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600">
                Epoch: <span className="text-blue-600 ml-1">{currentEpoch} / {history.length ? history.length - 1 : config.epochs}</span>
              </div>
            </div>

            {currentWeights ? (
               <HeatmapVisualization weights={currentWeights} features={FEATURE_NAMES} />
            ) : (
               <div className="flex-1 flex items-center justify-center text-slate-400">
                 <p>Configure parameters and click "Start Training"</p>
               </div>
            )}
          </div>
        </div>
      ) : (
        <AnalyticsTab />
      )}
    </div>
  );
}
