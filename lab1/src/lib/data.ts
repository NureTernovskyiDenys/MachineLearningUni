export type Point2D = {
  x: number;
  y: number;
};

export type DataSample = {
  point: Point2D;
  label: -1 | 1 | 0; // -1 or 0 depending on network architecture, we can standardise on 0/1 and map to -1/1 if needed. We'll use 0 and 1.
};

// Seeded or standard random normal distribution helper
function randomNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); 
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

export function generateLinearData(samplesPerClass: number, noise: number = 0.5): DataSample[] {
  const data: DataSample[] = [];
  
  // Class 0: Center around (-2, -2)
  for (let i = 0; i < samplesPerClass; i++) {
    data.push({
      point: {
        x: randomNormal(-2, noise),
        y: randomNormal(-2, noise)
      },
      label: 0
    });
  }

  // Class 1: Center around (2, 2)
  for (let i = 0; i < samplesPerClass; i++) {
    data.push({
      point: {
        x: randomNormal(2, noise),
        y: randomNormal(2, noise)
      },
      label: 1
    });
  }

  return data;
}

export function generateXORData(samplesPerQuadrant: number, noise: number = 0.5): DataSample[] {
  const data: DataSample[] = [];

  // Bottom-Left (Label 0) (-2, -2)
  for (let i = 0; i < samplesPerQuadrant; i++) {
    data.push({
      point: { x: randomNormal(-2, noise), y: randomNormal(-2, noise) },
      label: 0
    });
  }

  // Top-Right (Label 0) (2, 2)
  for (let i = 0; i < samplesPerQuadrant; i++) {
    data.push({
      point: { x: randomNormal(2, noise), y: randomNormal(2, noise) },
      label: 0
    });
  }

  // Top-Left (Label 1) (-2, 2)
  for (let i = 0; i < samplesPerQuadrant; i++) {
    data.push({
      point: { x: randomNormal(-2, noise), y: randomNormal(2, noise) },
      label: 1
    });
  }

  // Bottom-Right (Label 1) (2, -2)
  for (let i = 0; i < samplesPerQuadrant; i++) {
    data.push({
      point: { x: randomNormal(2, noise), y: randomNormal(-2, noise) },
      label: 1
    });
  }

  return data;
}

export function trainTestSplit(data: DataSample[], trainRatio: number = 0.8): { train: DataSample[], test: DataSample[] } {
  // Shuffle array securely
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const splitIndex = Math.floor(shuffled.length * trainRatio);
  return {
    train: shuffled.slice(0, splitIndex),
    test: shuffled.slice(splitIndex)
  };
}
