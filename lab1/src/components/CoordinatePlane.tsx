import { useEffect, useRef } from 'react';
import type { DataSample } from '../lib/data';
import { MultiLayerPerceptron } from '../lib/nn';

interface CoordinatePlaneProps {
  data: DataSample[];
  network: 'SLP' | 'MLP';
  slpParams: { w1: number; w2: number; b: number } | null;
  mlp: MultiLayerPerceptron | null;
  epoch: number; // to trigger re-renders
}

export const CoordinatePlane: React.FC<CoordinatePlaneProps> = ({ data, network, slpParams, mlp, epoch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    // Logical size
    const width = 600;
    const height = 600;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = '#e5e7eb'; // zinc-200
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Map cartesian (-4 to 4) to canvas
    const range = 4;
    const toCanvasX = (x: number) => (x + range) * (width / (range * 2));
    const toCanvasY = (y: number) => height - (y + range) * (height / (range * 2));

    // Draw MLP Heatmap if active
    if (network === 'MLP' && mlp) {
      const blockSize = 8; // Adjust for perf vs quality
      for (let i = 0; i < width; i += blockSize) {
        for (let j = 0; j < height; j += blockSize) {
          const cxOuter = (i / width) * (range * 2) - range;
          const cyOuter = range - (j / height) * (range * 2);
          
          const p = mlp.predict(cxOuter, cyOuter);
          // red for 1, blue for 0
          const r = Math.floor(p * 236);
          const b = Math.floor((1 - p) * 236);
          ctx.fillStyle = `rgba(${r}, 72, ${b}, 0.25)`;
          ctx.fillRect(i, j, blockSize, blockSize);
        }
      }
    }

    // Draw SLP Line if active
    if (network === 'SLP' && slpParams && slpParams.w2 !== 0) {
      ctx.strokeStyle = '#10b981'; // emerald-500
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const xLeft = -range;
      const yLeft = (slpParams.b - slpParams.w1 * xLeft) / slpParams.w2;
      ctx.moveTo(toCanvasX(xLeft), toCanvasY(yLeft));

      const xRight = range;
      const yRight = (slpParams.b - slpParams.w1 * xRight) / slpParams.w2;
      ctx.lineTo(toCanvasX(xRight), toCanvasY(yRight));
      ctx.stroke();
    }

    // Draw Data Points
    data.forEach(d => {
      ctx.beginPath();
      ctx.arc(toCanvasX(d.point.x), toCanvasY(d.point.y), 5, 0, Math.PI * 2);
      ctx.fillStyle = d.label === 1 ? '#ef4444' : '#3b82f6'; // red-500 : blue-500
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

  }, [data, network, slpParams, mlp, epoch]);

  return (
    <div className="flex justify-center items-center w-full h-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="rounded-lg max-w-full h-auto aspect-square border border-zinc-100 dark:border-zinc-800"
          style={{ width: 600, height: 600, maxWidth: '100%' }}
        />
        <div className="absolute top-2 left-2 flex gap-2">
            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-white/80 dark:bg-zinc-800/80 rounded backdrop-blur border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Class 0
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-white/80 dark:bg-zinc-800/80 rounded backdrop-blur border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Class 1
            </div>
        </div>
      </div>
    </div>
  );
};
