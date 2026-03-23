export type NetworkConfig = {
  numNeurons: number;
  numFeatures: number;
  initialLearningRate: number;
  epochs: number;
  algorithm: 'WTA' | 'SOM';
  initialRadius?: number; // for SOM
};

export class KohonenNetwork {
  public weights: number[][]; // [neuronIndex][featureIndex]
  public config: NetworkConfig;

  constructor(config: NetworkConfig) {
    this.config = config;
    this.weights = [];
    
    // Initialize weights with small random values [0, 1]
    for (let i = 0; i < config.numNeurons; i++) {
      const neuronWeights = [];
      for (let j = 0; j < config.numFeatures; j++) {
        neuronWeights.push(Math.random());
      }
      this.weights.push(neuronWeights);
    }
  }

  // Calculate Euclidean Distance squared (avoids square root for efficiency since we only need comparative minimum)
  private getDistance(inputVector: number[], neuronWeights: number[]): number {
    let sum = 0;
    for (let i = 0; i < inputVector.length; i++) {
      const diff = inputVector[i] - neuronWeights[i];
      sum += diff * diff;
    }
    return sum; // returning squared distance is sufficient for finding the minimum
  }

  public findWinner(inputVector: number[]): number {
    let minDistance = Infinity;
    let winnerIndex = -1;

    for (let i = 0; i < this.weights.length; i++) {
      const distance = this.getDistance(inputVector, this.weights[i]);
      if (distance < minDistance) {
        minDistance = distance;
        winnerIndex = i;
      }
    }
    return winnerIndex;
  }

  // Single training step for a given input vector
  public trainStep(inputVector: number[], currentEpoch: number) {
    const winnerIndex = this.findWinner(inputVector);

    // Dynamic reduction of learning rate r(t)
    // using exponential decay: r(t) = r(0) * exp(-t / T) where T is total epochs
    const learningRate = this.config.initialLearningRate * Math.exp(-currentEpoch / this.config.epochs);

    // Determine neighborhood radius NE(t)
    // As per user's advice: for WTA, NE(t) is always 0.
    let radius = 0;
    if (this.config.algorithm === 'SOM') {
      const initialR = this.config.initialRadius || Math.max(1, Math.floor(this.config.numNeurons / 2));
      // Decay radius over time
      radius = initialR * Math.exp(-currentEpoch / (this.config.epochs / Math.log(initialR || 1 + 1)));
    }

    // Update weights for winner and its neighbors
    for (let i = 0; i < this.weights.length; i++) {
      // Distance in 1D grid topology
      const distToWinner = Math.abs(winnerIndex - i);

      if (distToWinner <= Math.round(radius)) {
        // Option: add distance penalty for SOM so further neighbors learn less
        // But standard basic formula is just the learning rate.
        const theta = this.config.algorithm === 'SOM' && radius > 0 
            ? Math.exp(-(distToWinner * distToWinner) / (2 * radius * radius)) 
            : 1;

        const effectiveLearningRate = learningRate * theta;

        for (let j = 0; j < this.config.numFeatures; j++) {
          this.weights[i][j] += effectiveLearningRate * (inputVector[j] - this.weights[i][j]);
        }
      }
    }
  }

  // Full training loop over the dataset
  public train(dataset: number[][]): { history: number[][][] } {
    const history: number[][][] = [];
    
    // Save initial state
    history.push(this.weights.map(w => [...w]));

    for (let epoch = 0; epoch < this.config.epochs; epoch++) {
      for (const dataPoint of dataset) {
        this.trainStep(dataPoint, epoch);
      }
      // Save state at the end of each epoch for visualization
      history.push(this.weights.map(w => [...w]));
    }

    return { history };
  }
}
