export function calculateSSE(targets: number[], predictions: number[]): number {
  if (targets.length !== predictions.length) throw new Error("Length mismatch");
  let sse = 0;
  for (let i = 0; i < targets.length; i++) {
    sse += 0.5 * Math.pow(targets[i] - predictions[i], 2);
  }
  return sse;
}

export function calculateRelativeError(targets: number[], predictions: number[]): number {
  if (targets.length === 0) return 0;
  let errorCount = 0;
  for (let i = 0; i < targets.length; i++) {
    // Treat as classification output: predictions > 0.5 mean 1, else 0
    const predClass = predictions[i] >= 0.5 ? 1 : 0;
    if (predClass !== targets[i]) {
      errorCount++;
    }
  }
  // Returns error percentage
  return (errorCount / targets.length) * 100;
}
