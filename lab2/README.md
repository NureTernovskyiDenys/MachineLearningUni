# Neural Network Clustering Visualizer: WTA & SOM

## Overview

This is an interactive React application designed to visualize and analyze unsupervised neural network learning algorithms: **Winner-Takes-All (WTA)** and **Self-Organizing Map (SOM)**.

The project demonstrates how these algorithms cluster multi-dimensional data, specifically focusing on a simulated dataset of laptops with various physical and technical characteristics (Price, RAM, VRAM, Weight, Thickness, etc.).

## 🚀 Key Features

- **Real-time Visualization**: Watch the neural network learn and adapt to the dataset through an interactive Heatmap that displays the weight matrix connecting features to neurons.
- **Algorithm Comparison**: Seamlessly switch between the "selfish" **WTA** algorithm and the topological **SOM** algorithm to observe their distinct learning behaviors.
- **Dynamic Dataset Generation**: Generate new laptop datasets on the fly with adjustable noise levels and sample sizes to test network robustness.
- **Comprehensive Analytics Module**: Automatically calculates and charts the impact of hyperparameters using *Recharts*:
  - **Quantization Error vs. Initial Learning Rate $r(0)$**: Helps find the optimal learning step.
  - **WTA vs. SOM Error over Epochs**: Compares learning efficiency over time.
  - **Error vs. Dataset Size**: Demonstrates the impact of sample representativeness.

## 🛠️ Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + `clsx` + `tailwind-merge`
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🧠 Deep Dive: Parameters

### Control Panel
- **Algorithm**: 
  - **WTA**: Updates the weights of *only* the winning neuron (the one closest to the input vector).
  - **SOM**: Updates the weights of the winning neuron *and* its neighbors, allowing the network to build a smooth topographical map.
- **Initial Learning Rate $r(0)$**: The starting step size for weight adjustments. It decays automatically as epochs progress to ensure convergence.
- **Epochs**: The number of complete passes the network makes through the entire dataset.
- **Number of Neurons**: Defines the number of output clusters (e.g., setting it to 10 allows the network to find 10 distinct groupings of laptops).

### Dataset Settings
- **Dataset Noise**: Introduces random variations (%) to the base laptop profiles to simulate real-world data diversity.
- **Samples per Class**: Sets the number of examples generated for each base laptop category (e.g., Gaming, Ultrabook, Budget).

### The Heatmap (Weight Strength)
- The heatmap columns represent individual **Neurons**, and rows represent **Features**.
- A **dark/opaque cell** (closer to 1.0) means the neuron is highly sensitive to that specific feature.
- A **light/transparent cell** (closer to 0.0) means the neuron expects a low value for that feature.

## 🏃‍♂️ Getting Started

### Prerequisites
Make sure you have Node.js installed.

### Installation & Execution

1. Clone this repository (or download the source).
2. Install the project dependencies:
```bash
npm install
```
3. Start the Vite development server:
```bash
npm run dev
```
4. Open your browser and navigate to the local server URL (usually `http://localhost:5173/`).

## 📜 License

This project is created for educational purposes as part of Artificial Intelligence coursework.
