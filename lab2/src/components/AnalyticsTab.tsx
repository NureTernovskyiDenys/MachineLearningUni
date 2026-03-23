import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { generateDataset } from '../lib/dataset';
import { KohonenNetwork } from '../lib/network';
import type { NetworkConfig } from '../lib/network';

export default function AnalyticsTab() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    learningRateImpact: any[];
    algorithmCompare: any[];
    sampleSizeImpact: any[];
  } | null>(null);

  // Helper function to calculate Quantization Error
  const calculateError = (network: KohonenNetwork, dataset: number[][]) => {
    let totalError = 0;
    for (const data of dataset) {
      const winnerIndex = network.findWinner(data);
      const winnerWeights = network.weights[winnerIndex];
      
      // Calculate euclidian distance
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const diff = data[i] - winnerWeights[i];
        sum += diff * diff;
      }
      totalError += Math.sqrt(sum);
    }
    return totalError / dataset.length;
  };

  const runExperiments = async () => {
    setIsRunning(true);
    
    // Using setTimeout to allow UI to render "Running..." state
    setTimeout(() => {
      try {
        const defaultDataset = generateDataset(20, 0.05);
        const numericData = defaultDataset.map(d => d.features);
        const baseConfig: NetworkConfig = {
          numNeurons: 10,
          numFeatures: 10,
          initialLearningRate: 0.5,
          epochs: 100,
          algorithm: 'SOM',
          initialRadius: 3
        };

        // 1. Dependency of error on r(0)
        const learningRateImpact = [];
        const rValues = [0.01, 0.05, 0.1, 0.3, 0.5, 0.7, 1.0];
        
        for (const r of rValues) {
          const net = new KohonenNetwork({ ...baseConfig, initialLearningRate: r });
          net.train(numericData);
          const err = calculateError(net, numericData);
          learningRateImpact.push({ r_value: r, error: err });
        }

        // 2. Comparison WTA vs SOM error over different Epochs
        const algorithmCompare = [];
        const epochValues = [10, 50, 100, 200, 500];

        for (const ep of epochValues) {
          const wtaNet = new KohonenNetwork({ ...baseConfig, algorithm: 'WTA', epochs: ep });
          wtaNet.train(numericData);
          const wtaErr = calculateError(wtaNet, numericData);

          const somNet = new KohonenNetwork({ ...baseConfig, algorithm: 'SOM', epochs: ep });
          somNet.train(numericData);
          const somErr = calculateError(somNet, numericData);

          algorithmCompare.push({ epochs: ep, WTA_Error: wtaErr, SOM_Error: somErr });
        }

        // 3. Influence of sample size
        const sampleSizeImpact = [];
        const sampleSizes = [5, 10, 20, 50, 100]; // per class
        for (const size of sampleSizes) {
          const dataForSize = generateDataset(size, 0.05);
          const numericForSize = dataForSize.map(d => d.features);

          const net = new KohonenNetwork(baseConfig);
          net.train(numericForSize);
          const err = calculateError(net, numericForSize);
          
          sampleSizeImpact.push({ samples_per_class: size, total_samples: size * 5, error: err });
        }

        setResults({
          learningRateImpact,
          algorithmCompare,
          sampleSizeImpact
        });
      } finally {
        setIsRunning(false);
      }
    }, 100);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-slate-100 flex flex-col gap-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Experiment Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">
            Run automated training rounds to gather statistics on hyperparameter impact.
          </p>
        </div>
        <button
          onClick={runExperiments}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm disabled:bg-slate-400"
        >
          {isRunning ? "Running Simulations..." : "Run All Experiments"}
        </button>
      </div>

      {results ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Error vs Learning Rate */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <h3 className="text-md font-bold text-slate-700 mb-4 text-center">Quantization Error vs Initial r(0)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.learningRateImpact} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="r_value" label={{ value: 'Initial Learning Rate', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Avg Quantization Error', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="error" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Avg Error" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: WTA vs SOM */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <h3 className="text-md font-bold text-slate-700 mb-4 text-center">WTA vs SOM Error over Epochs</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.algorithmCompare} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="epochs" label={{ value: 'Epochs', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="WTA_Error" fill="#ef4444" radius={[4, 4, 0, 0]} name="WTA Error" />
                  <Bar dataKey="SOM_Error" fill="#10b981" radius={[4, 4, 0, 0]} name="SOM Error" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Sample Size Impact */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 lg:col-span-2">
             <h3 className="text-md font-bold text-slate-700 mb-4 text-center">Error vs Dataset Size (Samples Per Class)</h3>
             <div className="h-[300px] w-full max-w-3xl mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.sampleSizeImpact} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="samples_per_class" label={{ value: 'Samples per Class', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Line type="monotone" dataKey="error" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} name="Avg Error" />
                </LineChart>
              </ResponsiveContainer>
             </div>
          </div>

        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg">Click "Run All Experiments" to generate analytical data.</p>
        </div>
      )}
    </div>
  );
}
