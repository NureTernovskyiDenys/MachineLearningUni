import { useEffect, useState, useMemo } from 'react';
import { FilterSlider } from './components/FilterSlider';
import { LaptopCard } from './components/LaptopCard';
import type { IdealState, LaptopParsed } from './types';
import { processLaptops, calculateSimilarity } from './utils/dataProcessor';
import { IndianRupee, MemoryStick, Cpu, Weight, Laptop, SearchX } from 'lucide-react';

function App() {
  const [laptops, setLaptops] = useState<LaptopParsed[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [idealState, setIdealState] = useState<IdealState>({
    price: 60000,
    ram: 16,
    weight: 1.5,
    cpuFreq: 2.8
  });

  const [ranges] = useState({
    price: { min: 20000, max: 200000 },
    ram: { min: 4, max: 64 },
    weight: { min: 0.9, max: 4.0 },
    cpuFreq: { min: 1.0, max: 5.0 }
  });

  useEffect(() => {
    fetch('/laptops.csv')
      .then(res => res.text())
      .then(csv => {
        const parsed = processLaptops(csv);
        setLaptops(parsed);
        // We could dynamically set ranges here, but predefined ranges provide a stabler UX.
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load generic laptops dataset", err);
        setLoading(false);
      });
  }, []);

  const sortedLaptops = useMemo(() => {
    if (laptops.length === 0) return [];
    
    // Calculate normalized ideal state for Euclidean distance math
    const safeScale = (val: number, min: number, max: number) => {
      const clamped = Math.min(Math.max(val, min), max); // Ensure between [0, 1]
      return (max === min) ? 0.5 : (clamped - min) / (max - min);
    };

    // We need the true min/max bounds from the dataset to normalize the ideal slider value correctly.
    // Instead of computing dynamically every time, let's use the actual min/max of the dataset components we have set in our state.
    // However, for pure interactive feedback, we can use the slider's absolute min/max.
    // But DataProcessor normalized based on data true min/max.
    // Let's compute actual min/max dynamically from the parsed laptops:
    const dataMinMax = laptops.reduce((acc, curr) => {
      acc.price[0] = Math.min(acc.price[0], curr.price);
      acc.price[1] = Math.max(acc.price[1], curr.price);
      acc.ram[0] = Math.min(acc.ram[0], curr.ram);
      acc.ram[1] = Math.max(acc.ram[1], curr.ram);
      acc.weight[0] = Math.min(acc.weight[0], curr.weight);
      acc.weight[1] = Math.max(acc.weight[1], curr.weight);
      acc.cpu[0] = Math.min(acc.cpu[0], curr.cpuFreq);
      acc.cpu[1] = Math.max(acc.cpu[1], curr.cpuFreq);
      return acc;
    }, {
      price: [Infinity, -Infinity], ram: [Infinity, -Infinity],
      weight: [Infinity, -Infinity], cpu: [Infinity, -Infinity]
    });

    const normIdeal = {
      normPrice: safeScale(idealState.price, dataMinMax.price[0], dataMinMax.price[1]),
      normRam: safeScale(idealState.ram, dataMinMax.ram[0], dataMinMax.ram[1]),
      normWeight: safeScale(idealState.weight, dataMinMax.weight[0], dataMinMax.weight[1]),
      normCpuFreq: safeScale(idealState.cpuFreq, dataMinMax.cpu[0], dataMinMax.cpu[1]),
    };

    const scored = laptops.map(laptop => ({
      ...laptop,
      similarityScore: calculateSimilarity(laptop, normIdeal)
    }));

    return scored.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
  }, [laptops, idealState]);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
            <Laptop size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Smart Laptop Finder
            </h1>
            <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">AI MATCHING ENGINE</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar - Filter Sliders */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <h2 className="text-xl font-bold mb-1 text-slate-100">Ideal Device</h2>
            <p className="text-sm text-slate-400 mb-6">Describe your perfect laptop and AI will orchestrate the best matches.</p>
            
            <div className="flex flex-col gap-5">
              <FilterSlider 
                label="Target Price"
                icon={<IndianRupee size={16} />}
                min={ranges.price.min}
                max={ranges.price.max}
                step={1000}
                value={idealState.price}
                unit="₹"
                onChange={(val) => setIdealState(prev => ({ ...prev, price: val }))}
              />
              <FilterSlider 
                label="Desired RAM"
                icon={<MemoryStick size={16} />}
                min={ranges.ram.min}
                max={ranges.ram.max}
                step={4}
                value={idealState.ram}
                unit="GB"
                onChange={(val) => setIdealState(prev => ({ ...prev, ram: val }))}
              />
              <FilterSlider 
                label="Optimal Weight"
                icon={<Weight size={16} />}
                min={ranges.weight.min}
                max={ranges.weight.max}
                step={0.1}
                value={idealState.weight}
                unit="kg"
                onChange={(val) => setIdealState(prev => ({ ...prev, weight: val }))}
              />
              <FilterSlider 
                label="CPU Frequency"
                icon={<Cpu size={16} />}
                min={ranges.cpuFreq.min}
                max={ranges.cpuFreq.max}
                step={0.1}
                value={idealState.cpuFreq}
                unit="GHz"
                onChange={(val) => setIdealState(prev => ({ ...prev, cpuFreq: val }))}
              />
            </div>
          </div>
        </aside>

        {/* Right Content - Results Grid */}
        <section className="flex-1">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center p-20 animate-pulse">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium">Extracting data & initializing AI engine...</p>
            </div>
          ) : sortedLaptops.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Top Matches
                  <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30">
                    {sortedLaptops.length} items
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max" style={{ contentVisibility: 'auto' }}>
                {/* Use slice for performance, displaying top 50 */}
                {sortedLaptops.slice(0, 50).map((laptop) => (
                  <LaptopCard key={laptop.id} laptop={laptop} ideal={idealState} />
                ))}
              </div>
              {sortedLaptops.length > 50 && (
                <div className="text-center mt-8 text-slate-500 text-sm">
                  Showing top 50 results. Adjust sliders to explore further.
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center">
              <div className="p-4 bg-slate-800 rounded-full text-slate-500 mb-4 inline-block">
                <SearchX size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-2">No Laptops Found</h3>
              <p className="text-slate-500 max-w-sm">There seems to be an issue loading the dataset, or the file is empty.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
