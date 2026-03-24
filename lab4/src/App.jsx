import React, { useState, useEffect, useRef } from 'react';
import { 
  createEmptyGrid, 
  patterns, 
  trainHebb, 
  trainProjection, 
  asyncUpdateStep, 
  distortPattern 
} from './hopfieldLogic';
import Grid from './components/Grid';
import Controls from './components/Controls';
import { Activity } from 'lucide-react';

const App = () => {
  const [gridData, setGridData] = useState(styles => createEmptyGrid());
  const [weightMatrix, setWeightMatrix] = useState(null);
  const [learningRule, setLearningRule] = useState('hebb');
  const [learningRate, setLearningRate] = useState(1);
  const [distortionPercent, setDistortionPercent] = useState(20);
  
  const [isTrained, setIsTrained] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  
  const [accuracyLog, setAccuracyLog] = useState([]);

  // Use refs for the recognition loop to always access latest state
  const gridDataRef = useRef(gridData);
  const weightMatrixRef = useRef(weightMatrix);
  const isRecognizingRef = useRef(isRecognizing);
  
  // Track consecutive unchanged states to detect convergence
  const unchangedCountRef = useRef(0);

  useEffect(() => {
    gridDataRef.current = gridData;
    weightMatrixRef.current = weightMatrix;
    isRecognizingRef.current = isRecognizing;
  }, [gridData, weightMatrix, isRecognizing]);

  const togglePixel = (index) => {
    const newData = [...gridData];
    newData[index] = newData[index] === 1 ? -1 : 1;
    setGridData(newData);
  };

  const handleSelectDigit = (digit) => {
    setGridData([...patterns[digit]]);
  };

  const handleClear = () => {
    setGridData(createEmptyGrid());
    setIsRecognizing(false);
  };

  const handleTrain = () => {
    // Train on all 10 patterns (0-9)
    const activePatterns = Object.values(patterns);
    let W;
    if (learningRule === 'hebb') {
      W = trainHebb(activePatterns, learningRate);
    } else {
      W = trainProjection(activePatterns);
    }
    setWeightMatrix(W);
    setIsTrained(true);
  };

  const handleDistort = () => {
    const distorted = distortPattern(gridDataRef.current, distortionPercent);
    setGridData(distorted);
  };

  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const startRecognition = () => {
    if (!weightMatrix) return;
    setIsRecognizing(true);
    unchangedCountRef.current = 0;
  };

  const stopRecognition = () => {
    setIsRecognizing(false);
  };

  // Recognition Loop
  useEffect(() => {
    if (!isRecognizing) return;
    
    let timerId;
    
    const step = () => {
      if (!isRecognizingRef.current) return;
      
      const prev = gridDataRef.current;
      const next = asyncUpdateStep(prev, weightMatrixRef.current);
      
      setGridData(next);
      
      if (arraysEqual(prev, next)) {
        unchangedCountRef.current += 1;
      } else {
        unchangedCountRef.current = 0;
      }
      
      // Stop if stable for more than N steps (to ensure all neurons were sampled)
      if (unchangedCountRef.current > 300) {
        setIsRecognizing(false);
      } else {
        // Continue loop
        timerId = setTimeout(step, 10); // Fast animation frame
      }
    };
    
    timerId = setTimeout(step, 10);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [isRecognizing]);


  // Helper for benchmark
  const runSingleTest = (originalPattern, W, noisePercent) => {
    let state = distortPattern(originalPattern, noisePercent);
    let unchanged = 0;
    
    // Max 1000 steps to prevent infinite loop just in case
    for (let i = 0; i < 2000; i++) {
      const prev = state;
      state = asyncUpdateStep(prev, W);
      if (arraysEqual(prev, state)) {
        unchanged++;
        if (unchanged > 200) break; // converged
      } else {
        unchanged = 0;
      }
    }
    
    return arraysEqual(state, originalPattern);
  };

  const handleRunBenchmark = () => {
    if (!weightMatrix) return;
    
    setIsRecognizing(false); // Stop UI loop if running
    
    const noiseLevels = [10, 20, 30, 40, 50];
    const testsPerLevel = 20; // total 100 tests
    const activePatterns = Object.values(patterns);
    
    const newLog = [...accuracyLog];
    
    // To not block UI thread completely, we can use a timeout loop or just run it synchronously if fast enough.
    // Given 100 tests max 2000 steps each = 200,000 steps. In JS it will take around 50ms.
    // Let's run it synchronously for simplicity.
    
    setTimeout(() => {
        noiseLevels.forEach(noise => {
            let successes = 0;
            // Test each digit a few times
            for (let t = 0; t < testsPerLevel; t++) {
                // random digit
                const digit = Math.floor(Math.random() * 10);
                const original = patterns[digit];
                const success = runSingleTest(original, weightMatrix, noise);
                if (success) successes++;
            }
            const accuracy = (successes / testsPerLevel) * 100;
            newLog.push({ noise, accuracy, timestamp: Date.now() });
        });
        
        setAccuracyLog(newLog);
    }, 10); // defer to allow UI tick
    
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 font-sans flex flex-col items-center">
      <header className="mb-8 text-center max-w-3xl">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 flex justify-center items-center gap-3">
           Мережа Хопфілда <Activity className="text-purple-400"/>
        </h1>
        <p className="text-slate-400">
          Інтерактивна демонстрація розпізнавання цифр (0-9) на сітці 10x10.
        </p>
      </header>

      <main className="flex flex-col md:flex-row gap-12 w-full max-w-5xl justify-center items-start">
        
        {/* Left: Graphic representation */}
        <section className="flex flex-col items-center gap-6">
          <div className="relative">
             <Grid 
              pattern={gridData} 
              onTogglePixel={togglePixel} 
              isRecognizing={isRecognizing} 
             />
             
             {/* Simple status indicator Overlay */}
             {isRecognizing && (
               <div className="absolute top-2 right-2 flex items-center gap-2 bg-blue-500/80 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg backdrop-blur-sm">
                 <span className="w-2 h-2 rounded-full bg-white"></span>
                 Розпізнавання...
               </div>
             )}
          </div>
          
          <div className="text-center text-slate-500 text-sm">
            Клікніть по пікселях, щоб змінити їх стан вручну.
          </div>
        </section>

        {/* Right: Controls Panel */}
        <Controls
          onSelectDigit={handleSelectDigit}
          learningRule={learningRule}
          setLearningRule={setLearningRule}
          learningRate={learningRate}
          setLearningRate={setLearningRate}
          distortionPercent={distortionPercent}
          setDistortionPercent={setDistortionPercent}
          onDistort={handleDistort}
          onRecognize={startRecognition}
          onStop={stopRecognition}
          onClear={handleClear}
          onRunBenchmark={handleRunBenchmark}
          isRecognizing={isRecognizing}
          isTrained={isTrained}
          onTrain={handleTrain}
          accuracyLog={accuracyLog}
        />
        
      </main>
    </div>
  );
};

export default App;
