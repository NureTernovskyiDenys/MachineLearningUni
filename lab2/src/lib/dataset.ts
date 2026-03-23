export type ComputerParams = [
  number, // 0: cpuFreq (GHz)
  number, // 1: ramDb (GB)
  number, // 2: storageSize (GB)
  number, // 3: weight (kg)
  number, // 4: price ($)
  number, // 5: batteryCapacity (Wh)
  number, // 6: screenSize (inches)
  number, // 7: gpuVram (GB)
  number, // 8: ports (count)
  number, // 9: thickness (mm)
];

export interface DataPoint {
  features: ComputerParams;
  label: string;
}

const CLASS_PROTOTYPES: Record<string, ComputerParams> = {
  "Gaming Laptop": [4.0, 32, 2000, 3.0, 2500, 90, 17.3, 16, 4, 30],
  "Ultrabook": [2.5, 16, 512, 1.2, 1200, 60, 13.5, 0, 2, 12],
  "Budget Office": [2.0, 8, 256, 1.8, 500, 40, 15.6, 0, 3, 20],
  "Workstation": [3.5, 64, 4000, 2.5, 4000, 80, 16, 24, 5, 25],
  "Student Chromebook": [1.1, 4, 64, 1.0, 250, 50, 11.6, 0, 2, 15],
};

export const FEATURE_NAMES = [
  "CPU Freq (GHz)",
  "RAM (GB)",
  "Storage (GB)",
  "Weight (kg)",
  "Price ($)",
  "Battery (Wh)",
  "Screen ('')",
  "VRAM (GB)",
  "Ports",
  "Thickness (mm)",
];

export function generateDataset(samplesPerClass: number, noiseLevel: number): DataPoint[] {
  const dataset: DataPoint[] = [];

  // Generate base data
  for (const [label, baseFeatures] of Object.entries(CLASS_PROTOTYPES)) {
    for (let i = 0; i < samplesPerClass; i++) {
        // We will copy the base features.
        // We add a tiny bit of pre-normalization noise so that all points in a class aren't strictly identical zeroes and ones
        const features = baseFeatures.map(val => {
            const smallNoise = (Math.random() * 2 - 1) * 0.01 * val; 
            return val + smallNoise;
        }) as ComputerParams;
        
        dataset.push({ features, label });
    }
  }

  // Find min and max for each feature across the generated dataset
  const mins = new Array(10).fill(Infinity);
  const maxs = new Array(10).fill(-Infinity);

  for (const data of dataset) {
    for (let i = 0; i < 10; i++) {
      if (data.features[i] < mins[i]) mins[i] = data.features[i];
      if (data.features[i] > maxs[i]) maxs[i] = data.features[i];
    }
  }

  // Normalize to [0, 1] and apply requested noiseLevel to normalized values
  // user request: "додавати до кожного нормалізованого значення випадкове число в межах ±noiseLevel * value"
  const normalizedDataset: DataPoint[] = dataset.map((data) => {
    const normalizedFeatures = data.features.map((val, i) => {
      // Min-Max Normalization
      const range = maxs[i] - mins[i];
      let normVal = range === 0 ? 0 : (val - mins[i]) / range;

      // Add proportional noise
      const noise = (Math.random() * 2 - 1) * noiseLevel * normVal;
      normVal += noise;

      // Clamp to [0, 1] just in case noise pushes it out of bounds slightly
      return Math.max(0, Math.min(1, normVal));
    }) as ComputerParams;

    return { features: normalizedFeatures, label: data.label };
  });

  // Shuffle dataset
  for (let i = normalizedDataset.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [normalizedDataset[i], normalizedDataset[j]] = [normalizedDataset[j], normalizedDataset[i]];
  }

  return normalizedDataset;
}
