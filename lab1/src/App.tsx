import { useState, useEffect, useCallback, useRef } from 'react';
import { generateLinearData, generateXORData } from './lib/data';
import type { DataSample } from './lib/data';
import { SingleLayerPerceptron, MultiLayerPerceptron } from './lib/nn';
import { calculateSSE, calculateRelativeError } from './lib/metrics';
import { ControlPanel } from './components/ControlPanel';
import { CoordinatePlane } from './components/CoordinatePlane';
import { MetricsChart } from './components/MetricsChart';

function App() {
  const [dataset, setDataset] = useState<'linear' | 'xor'>('linear');
  const [networkType, setNetworkType] = useState<'SLP' | 'MLP'>('SLP');
  const [learningRate, setLearningRate] = useState(0.1);
  const [isRunning, setIsRunning] = useState(false);

  const [data, setData] = useState<DataSample[]>([]);
  const [slp, setSlp] = useState(new SingleLayerPerceptron());
  const [mlp, setMlp] = useState(new MultiLayerPerceptron());

  const [epoch, setEpoch] = useState(0);
  const [metricsHistory, setMetricsHistory] = useState<{ epoch: number, sse: number, relError: number }[]>([]);

  // References to avoid stale closures in setInterval
  const stateRef = useRef({
    dataset, networkType, learningRate, data, slp, mlp, epoch, metricsHistory
  });

  useEffect(() => {
    stateRef.current = { dataset, networkType, learningRate, data, slp, mlp, epoch, metricsHistory };
  }, [dataset, networkType, learningRate, data, slp, mlp, epoch, metricsHistory]);

  const initEnvironment = useCallback(() => {
    setIsRunning(false);
    const newData = dataset === 'linear' ? generateLinearData(100, 0.5) : generateXORData(50, 0.4);
    setData(newData);
    setSlp(new SingleLayerPerceptron());
    setMlp(new MultiLayerPerceptron(4));
    setEpoch(0);
    setMetricsHistory([]);
  }, [dataset]);

  useEffect(() => {
    initEnvironment();
  }, [initEnvironment, networkType]); // Reset on network change too

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        const { networkType: net, learningRate: lr, data: currentData, slp: currentSlp, mlp: currentMlp, epoch: currentEpoch } = stateRef.current;

        let predictions: number[] = [];
        const targets = currentData.map(d => d.label);

        if (net === 'SLP') {
          currentSlp.trainEpoch(currentData, lr);
          predictions = currentData.map(d => currentSlp.predict(d.point.x, d.point.y));
        } else {
          currentMlp.trainEpoch(currentData, lr);
          predictions = currentData.map(d => currentMlp.predict(d.point.x, d.point.y));
        }

        const sse = calculateSSE(targets, predictions);
        const relError = calculateRelativeError(targets, predictions);
        const newEpoch = currentEpoch + 1;

        setEpoch(newEpoch);
        setMetricsHistory(prev => [...prev, { epoch: newEpoch, sse, relError }]);

        // Auto-stop if converged
        if (relError === 0 && net === 'SLP') {
          setIsRunning(false);
        }
        if (relError === 0 && sse < 1 && net === 'MLP') {
          setIsRunning(false);
        }

      }, 50); // 50ms per epoch step
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 md:p-10 font-sans text-zinc-900 dark:text-zinc-100 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ControlPanel
                dataset={dataset}
                setDataset={setDataset}
                network={networkType}
                setNetwork={setNetworkType}
                learningRate={learningRate}
                setLearningRate={setLearningRate}
                isRunning={isRunning}
                onStart={() => setIsRunning(true)}
                onStop={() => setIsRunning(false)}
                onReset={initEnvironment}
              />
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm text-sm">
                <h3 className="font-semibold mb-2">Current State</h3>
                <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                  <p>Epoch: <span className="font-mono text-zinc-900 dark:text-zinc-100">{epoch}</span></p>
                  <p>Samples: <span className="font-mono">{data.length}</span></p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 flex justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-2 border border-zinc-200/50 dark:border-zinc-800/50 min-h-[500px] lg:h-auto items-center">
              <CoordinatePlane
                data={data}
                network={networkType}
                slpParams={networkType === 'SLP' ? slp.getBoundary() : null}
                mlp={networkType === 'MLP' ? mlp : null}
                epoch={epoch}
              />
            </div>
          </div>

          <div className="w-full h-[400px]">
            <MetricsChart data={metricsHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
