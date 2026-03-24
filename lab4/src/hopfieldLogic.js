import { multiply, transpose, pinv, diag, identity, zeros, add, subtract } from 'mathjs';

// 1. Предметна область та дані
// Patterns are 10x10 grids (100 elements), where 1 is filled and -1 is empty.
const createPattern = (strPattern) => {
  return strPattern.replace(/\s/g, '').split('').map(char => char === 'O' ? 1 : -1);
};

// Patterns for 0-9 (using 'O' for filled, '.' for empty)
export const patterns = {
  0: createPattern(`
    . . O O O O O . . .
    . O O . . . O O . .
    O O . . . . . O O .
    O O . . . . . O O .
    O O . . . . . O O .
    O O . . . . . O O .
    O O . . . . . O O .
    . O O . . . O O . .
    . . O O O O O . . .
    . . . . . . . . . .
  `),
  1: createPattern(`
    . . . . O O . . . .
    . . . O O O . . . .
    . . O O O O . . . .
    . . . . O O . . . .
    . . . . O O . . . .
    . . . . O O . . . .
    . . . . O O . . . .
    . . O O O O O O . .
    . . O O O O O O . .
    . . . . . . . . . .
  `),
  2: createPattern(`
    . . . O O O O . . .
    . . O O . . O O . .
    . O O . . . . O O .
    . . . . . . . O O .
    . . . . . O O O . .
    . . . . O O . . . .
    . . . O O . . . . .
    . . O O . . . . . .
    . O O O O O O O O .
    . . . . . . . . . .
  `),
  3: createPattern(`
    . . O O O O O O . .
    . . . . . . . O O .
    . . . . . . . O O .
    . . . . O O O O . .
    . . . . . . . O O .
    . . . . . . . . O O
    . . . . . . . . O O
    . . O O . . . . O O
    . . . O O O O O . .
    . . . . . . . . . .
  `),
  4: createPattern(`
    . . . . . . O O . .
    . . . . . O O O . .
    . . . . O O O O . .
    . . . O O . O O . .
    . . O O . . O O . .
    . O O . . . O O . .
    O O O O O O O O O .
    . . . . . . O O . .
    . . . . . . O O . .
    . . . . . . . . . .
  `),
  5: createPattern(`
    . . O O O O O O O .
    . . O O . . . . . .
    . . O O . . . . . .
    . . O O O O O . . .
    . . . . . . O O . .
    . . . . . . . O O .
    . . . . . . . O O .
    . . O O . . . O O .
    . . . O O O O O . .
    . . . . . . . . . .
  `),
  // Fill the rest with some distinct enough representations
  6: createPattern(`
    . . . . O O O O . .
    . . . O O . . . . .
    . . O O . . . . . .
    . O O O O O O . . .
    . O O . . . O O . .
    O O . . . . . O O .
    O O . . . . . O O .
    . O O . . . O O . .
    . . O O O O O . . .
    . . . . . . . . . .
  `),
  7: createPattern(`
    . O O O O O O O O .
    . . . . . . . O O .
    . . . . . . O O . .
    . . . . . O O . . .
    . . . . O O . . . .
    . . . . O O . . . .
    . . . O O . . . . .
    . . . O O . . . . .
    . . O O . . . . . .
    . . . . . . . . . .
  `),
  8: createPattern(`
    . . . O O O O . . .
    . . O O . . O O . .
    . O O . . . . O O .
    . . O O . . O O . .
    . . . O O O O . . .
    . . O O . . O O . .
    . O O . . . . O O .
    . O O . . . . O O .
    . . O O . . O O . .
    . . . O O O O . . .
  `),
  9: createPattern(`
    . . O O O O O . . .
    . O O . . . O O . .
    O O . . . . . O O .
    O O . . . . . O O .
    . O O . . . O O O .
    . . O O O O O O O .
    . . . . . . . O O .
    . . . . . . O O . .
    . . O O O O O . . .
    . . . . . . . . . .
  `)
};

export const createEmptyGrid = () => Array(100).fill(-1);

/**
 * 2. Логіка мережі Хопфілда
 * Правило Хебба
 * @param {Array<Array<number>>} activePatterns - Array of selected 100-element patterns.
 * @param {number} learningRate (η)
 * @returns {Array<Array<number>>} 100x100 Weight matrix
 */
export const trainHebb = (activePatterns, learningRate = 1) => {
  const n = 100; // 10x10 grid
  
  // W = η * sum(x^k * (x^k)^T)
  // W is 100x100 matrix initially zeroes
  let W = Array.from({ length: n }, () => Array(n).fill(0));

  for (const pattern of activePatterns) {
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                // w_ij = sum(x_i^k * x_j^k)
                W[i][j] += learningRate * pattern[i] * pattern[j];
            }
        }
    }
  }

  // To match classical Hebb average, optionally divide by N.
  // Standard Hopfield definition: W = (1/N) * sum(xi * xj)
  const normBase = n; 
  for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
          W[i][j] /= normBase; // Normalization helps keeping values bounded
      }
      W[i][i] = 0; // w_ii = 0
  }

  return W;
};

/**
 * Метод проєкцій (Pseudoinverse)
 * @param {Array<Array<number>>} activePatterns - Array of selected 100-element patterns.
 * @returns {Array<Array<number>>} 100x100 Weight matrix
 */
export const trainProjection = (activePatterns) => {
    if (activePatterns.length === 0) {
        return Array.from({ length: 100 }, () => Array(100).fill(0));
    }
    
    // Create matrix X where each column is a pattern
    // activePatterns represents rows if array of arrays (k x N).
    // Transpose to get N x k matrix X.
    const X = transpose(activePatterns); 
    
    try {
        // Pseudoinverse of X = X^+
        const X_pinv = pinv(X);
        
        // W = X * X^+
        const W_matrix = multiply(X, X_pinv);
        
        // W matrix returned is N x N
        let W = W_matrix.valueOf(); // Convert mathjs type to JS array
        
        // Zero diagonal
        for (let i = 0; i < 100; i++) {
            W[i][i] = 0;
        }
        
        return W;
    } catch(e) {
        console.error("Pseudoinverse calculation failed", e);
        return Array.from({ length: 100 }, () => Array(100).fill(0));
    }
};

/**
 * Асинхронне оновлення 
 * takes the current state and returns a NEW state for ONE random neuron
 * @param {Array<number>} currentState - 100-element array
 * @param {Array<Array<number>>} W - 100x100 weight matrix
 * @returns {Array<number>}
 */
export const asyncUpdateStep = (currentState, W) => {
    const newState = [...currentState];
    const n = currentState.length;
    
    // Choose random neuron
    const i = Math.floor(Math.random() * n);
    
    // Calculate new state: sign(sum(W_ij * x_j))
    let h_i = 0;
    for (let j = 0; j < n; j++) {
        h_i += W[i][j] * currentState[j];
    }
    
    // Activation function
    newState[i] = h_i >= 0 ? 1 : -1;
    
    return newState;
};

/**
 * Спотворення
 * @param {Array<number>} pattern 
 * @param {number} percentage - 0-100 percentage of pixels to invert
 * @returns {Array<number>}
 */
export const distortPattern = (pattern, percentage) => {
    const distorted = [...pattern];
    const numToDistort = Math.floor((percentage / 100) * pattern.length);
    
    // Get unique random indices
    const indices = [];
    while (indices.length < numToDistort) {
        let randIdx = Math.floor(Math.random() * pattern.length);
        if (!indices.includes(randIdx)) {
            indices.push(randIdx);
        }
    }
    
    // Invert the selected pixels
    for (let idx of indices) {
        distorted[idx] = -distorted[idx];
    }
    
    return distorted;
};
