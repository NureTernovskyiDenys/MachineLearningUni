import React from 'react';

interface HeatmapProps {
  weights: number[][]; // [neuronIndex][featureIndex]
  features: string[];
}

export default function HeatmapVisualization({ weights, features }: HeatmapProps) {
  if (!weights || weights.length === 0) return null;

  const numNeurons = weights.length;

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="inline-block min-w-full">
        {/* Heatmap Grid */}
        <div className="grid gap-[2px] bg-slate-200 p-[2px] rounded-lg shadow-inner" style={{
           gridTemplateColumns: `max-content repeat(${numNeurons}, minmax(40px, 1fr))` 
        }}>
          
          {/* Header Row (Neurons) */}
          <div className="bg-white p-2 flex items-center justify-end pr-4 text-xs font-bold text-slate-500 rounded-tl uppercase tracking-wider">
            Features \ Neurons
          </div>
          {Array.from({ length: numNeurons }).map((_, i) => (
            <div key={`header-${i}`} className="bg-white p-2 flex items-center justify-center text-xs font-bold text-slate-700">
              N{i + 1}
            </div>
          ))}

          {/* Data Rows */}
          {features.map((featureName, fIdx) => (
            <React.Fragment key={`row-${fIdx}`}>
              {/* Feature Label */}
              <div className="bg-white p-2 px-4 flex items-center justify-end text-sm font-medium text-slate-700 whitespace-nowrap">
                {featureName}
              </div>

              {/* Neuron Cells for this Feature */}
              {Array.from({ length: numNeurons }).map((_, nIdx) => {
                const weight = weights[nIdx][fIdx];
                // Using interpolation for a rich heatmap effect from slate-50 to indigo-600
                // We'll use an rgba approach based on the primary indigo color: rgba(79, 70, 229, alpha)
                // To avoid it being completely white at 0, we set minimum opacity
                const opacity = Math.max(0.05, Math.min(1, weight));
                
                return (
                  <div
                    key={`cell-${nIdx}-${fIdx}`}
                    className="relative group bg-white flex items-center justify-center min-h-[40px] transition-colors duration-300 ease-in-out"
                  >
                    <div 
                      className="absolute inset-0 transition-opacity duration-300 ease-in-out pointer-events-none"
                      style={{ backgroundColor: `rgba(79, 70, 229, ${opacity})` }}
                    />
                    
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute z-10 bottom-full mb-1 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none transition-opacity">
                      Weight: {weight.toFixed(3)}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Weight Strength</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">0.0</span>
          <div className="w-48 h-3 rounded-full bg-gradient-to-r from-[rgba(79,70,229,0.05)] to-[rgba(79,70,229,1)] shadow-inner"></div>
          <span className="text-xs text-slate-500">1.0</span>
        </div>
      </div>
    </div>
  );
}
