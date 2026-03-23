# 🧠 Perceptron Playground App

![Application Screenshot](placeholder_main_app_screenshot.png)

An interactive React application designed to visualize and explore the behavior of Single-Layer Perceptrons (SLPs) and Multi-Layer Perceptrons (MLPs) on both linearly and non-linearly separable datasets.

## 🌟 Overview

This project was built to provide an intuitive understanding of foundational neural network architectures. It allows users to experiment with different datasets (Linear, XOR), architectures (SLP, MLP), and learning parameters in real-time.

## 🚀 Features
- **Visual Learning Process:** Watch the decision boundary update in real-time as the network learns.
- **Multiple Datasets:** Test models on simple linearly separable data or complex non-linear XOR data.
- **Architecture Selection:** Switch between Single-Layer and Multi-Layer Perceptrons.
- **Real-time Metrics:** Monitor training epochs, error convergence (SSE), and classification accuracy tracking.

## 🛠️ Technology Stack
- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Visualization:** HTML5 Canvas

## 📖 Component Explanations

Here is a detailed breakdown of the interface elements and terms used within the application:

### 1. Dataset
**Purpose:** Selects the task (type of points) the neural network will train on.
*   **Linear (Linearly Separable Data):** The simplest dataset where points of two different classes can be separated by a single straight line. This is a classic mathematical problem perfectly solvable by a Single-Layer Perceptron (SLP).
*   **XOR (Non-Linearly Separable Data):** These points are arranged in 4 clusters (like a chessboard pattern). They cannot be separated by a single line. This problem demonstrates the limitations of SLP and the necessity of using a Multi-Layer Perceptron (MLP) capable of drawing complex, non-linear boundaries.

### 2. Architecture
**Purpose:** Selects the type of neural network to solve the chosen dataset problem.
*   **SLP (Single-Layer Perceptron):** Has only inputs and a single output. Uses a hard threshold activation function (step function) and Rosenblatt's learning algorithm. It can only draw simple straight decision lines.
*   **MLP (Multi-Layer Perceptron):** Has a "hidden" layer with 4 neurons and uses a smooth sigmoid activation function. It trains using the Backpropagation algorithm and builds highly flexible, non-linear decision surfaces.

### 3. Learning Rate, `r`
**Purpose:** Determines the size of the "correction" step for the neuron's weights ($W$) at each training step when the model makes a mistake.
*   If the value is **too large**: The network will overshoot optimal values (the decision line will jump back and forth erratically).
*   If the value is **too small**: The network will learn in tiny steps, requiring a massive number of epochs (and time) to converge.

### 4. Current State
**Purpose:** A real-time dashboard for the training process.
*   **Epoch:** One complete cycle where the algorithm has learned (updated its weights) over **all** points in the dataset. Training stops automatically once the network fully solves the problem.
*   **Samples:** The total number of generated points used for training.

### 5. Decision Boundary & Data Points
**Purpose:** The main visual element — a mathematical coordinate plane.
*   **Data Points:** Generated dots of two colors (Class 0 - blue, Class 1 - red) with added random scatter (noise).
*   **Straight Green Line (for SLP):** This is the "decision boundary" (hyperplane). During training, it actively changes its slope and position until it separates the red points from the blue ones.
*   **Gradient Background / Heatmap (for MLP):** Visualizes the non-linear probabilistic model by coloring the background. For instance, if an area turns red, it means the MLP is highly confident that any point there belongs to Class 1.

### 6. Error Convergence (Chart)
**Purpose:** Displays learning analytics for each epoch.
*   **Purple Line (SSE, $E$):** Sum of Squared Errors. The goal of training is to "reduce this error to zero".
*   **Pink Line (Rel. Error, $\sigma$ %):** Relative Error (classification error) in percentage. It shows the percentage of points currently classified incorrectly. The goal is to reach 0%.

## 💻 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```

2. **Navigate into the project directory:**
   ```bash
   cd Lb1
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📸 Screenshots

| SLP on Linear Data | MLP on XOR Data |
| :---: | :---: |
| ![SLP Linear](placeholder_slp_linear.png) | ![MLP XOR](placeholder_mlp_xor.png) |
| *Visualizing a Single-Layer Perceptron separating linear data.* | *Visualizing a Multi-Layer Perceptron separating complex non-linear XOR data.* |

## 🎓 About
This project was developed as a laboratory work (Lb1) for an AI Course, demonstrating the foundational concepts of single-layer and multi-layer perceptrons, dataset separability, and visual convergence analysis.
