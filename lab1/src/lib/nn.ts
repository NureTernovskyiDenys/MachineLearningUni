import type { DataSample } from "./data";

export function unitStep(x: number): number {
  return x >= 0 ? 1 : 0;
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function sigmoidDerivativeFromOutput(y: number): number {
  return y * (1 - y);
}

export class SingleLayerPerceptron {
  weights: [number, number];
  bias: number;

  constructor() {
    this.weights = [Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1];
    this.bias = Math.random() * 0.2 - 0.1;
  }

  predict(x1: number, x2: number): number {
    const sum = this.weights[0] * x1 + this.weights[1] * x2 - this.bias;
    return unitStep(sum);
  }

  trainEpoch(data: DataSample[], learningRate: number): void {
    for (const sample of data) {
      const { x, y } = sample.point;
      const d = sample.label;
      const actual = this.predict(x, y);

      const error = d - actual;
      if (error !== 0) {
        this.weights[0] += learningRate * error * x;
        this.weights[1] += learningRate * error * y;
        this.bias -= learningRate * error;
      }
    }
  }

  // Returns A, B, C for line Ax + By + C = 0 (here W1*x + W2*y - bias = 0)
  getBoundary(): { w1: number; w2: number; b: number } {
    return { w1: this.weights[0], w2: this.weights[1], b: this.bias };
  }
}

export class MultiLayerPerceptron {
  hiddenSize: number;
  w1: number[][];
  b1: number[];
  w2: number[];
  b2: number;

  constructor(hiddenSize = 4) {
    this.hiddenSize = hiddenSize;
    this.w1 = Array.from({ length: 2 }, () =>
      Array.from({ length: hiddenSize }, () => Math.random() * 2 - 1)
    );
    this.b1 = Array.from({ length: hiddenSize }, () => Math.random() * 2 - 1);
    this.w2 = Array.from({ length: hiddenSize }, () => Math.random() * 2 - 1);
    this.b2 = Math.random() * 2 - 1;
  }

  predict(x1: number, x2: number) {
    const { output } = this.forwardPass(x1, x2);
    return output;
  }

  forwardPass(x1: number, x2: number) {
    const hiddenIn = new Array(this.hiddenSize).fill(0);
    const hiddenOut = new Array(this.hiddenSize).fill(0);

    for (let i = 0; i < this.hiddenSize; i++) {
      hiddenIn[i] = x1 * this.w1[0][i] + x2 * this.w1[1][i] + this.b1[i];
      hiddenOut[i] = sigmoid(hiddenIn[i]);
    }

    let outIn = this.b2;
    for (let i = 0; i < this.hiddenSize; i++) {
      outIn += hiddenOut[i] * this.w2[i];
    }
    const output = sigmoid(outIn);

    return { hiddenOut, output };
  }

  trainEpoch(data: DataSample[], learningRate: number): void {
    for (const sample of data) {
      const { x, y } = sample.point;
      const d = sample.label;

      // Forward
      const { hiddenOut, output } = this.forwardPass(x, y);

      // Backward
      const error = d - output;
      const outputDelta = error * sigmoidDerivativeFromOutput(output);

      // Hidden layer deltas
      const hiddenDeltas = new Array(this.hiddenSize).fill(0);
      for (let i = 0; i < this.hiddenSize; i++) {
        hiddenDeltas[i] = outputDelta * this.w2[i] * sigmoidDerivativeFromOutput(hiddenOut[i]);
      }

      // Update Weights and Biases using delta rule
      for (let i = 0; i < this.hiddenSize; i++) {
        // Output layer
        this.w2[i] += learningRate * outputDelta * hiddenOut[i];

        // Hidden layer
        this.w1[0][i] += learningRate * hiddenDeltas[i] * x;
        this.w1[1][i] += learningRate * hiddenDeltas[i] * y;
        this.b1[i] += learningRate * hiddenDeltas[i];
      }
      this.b2 += learningRate * outputDelta;
    }
  }
}
