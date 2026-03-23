# Smart Laptop Finder

Smart Laptop Finder is an AI-powered React application that helps users find their ideal laptop. By adjusting interactive filter sliders for Target Price, Desired RAM, Optimal Weight, and CPU Frequency, the custom AI engine calculates a similarity score across a dynamic dataset of laptops to present the absolute best matches. 

The application uses Euclidean distance algorithms to sort and rank available laptops based on how well they fulfill your ideal specifications.

## 📸 Screenshots

<img width="1174" height="1070" alt="image" src="https://github.com/user-attachments/assets/d2f69c5f-ad52-453f-bbbe-229ff4a1e018" />
*Caption: Overview of the Smart Laptop Finder interface with top matches active.*

<img width="282" height="546" alt="image" src="https://github.com/user-attachments/assets/66699de5-2afb-4de2-b31a-88323c4145c8" />
*Caption: Adjustable filter sliders for personalized laptop matching.*

## ✨ Features

- **Interactive Filtering Sliders**: Easily set your ideal laptop specifications, including Price (₹), RAM (GB), Weight (kg), and CPU Frequency (GHz).
- **AI Matching Engine**: Uses normalized Euclidean distance math to calculate an optimal similarity score.
- **Dynamic Results**: The top matches list instantly updates as you refine your preferences on the sliders, rendering the top 50 laptops to avoid performance bottlenecks.
- **Modern and Responsive UI**: Built with Tailwind CSS and Lucide React icons for a beautiful, sleek, and mobile-friendly design.
- **Client-Side CSV Data Parsing**: Extracts raw dataset directly in the browser via `PapaParse`.

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React 
- **Data Parsing**: PapaParse

## 🛠️ Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) installed to run this project.

### Installation

1. Clone the repository (if you haven't already):
   ```bash
   git clone <repository-url>
   ```

2. Navigate into the project directory:
   ```bash
   cd testLab2Filter
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the Vite development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Data Source

The application automatically expects a `laptops.csv` file inside the `public` directory upon loading. Ensure the file contains valid columns at least for `Price`, `Ram`, `Weight`, and `Cpu`.


## 📄 License

This project is open-sourced and available under the terms of the [MIT License](LICENSE).
