import NetworkDashboard from './components/NetworkDashboard';

function App() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kohonen SOM & WTA Visualizer</h1>
        <p className="text-slate-600 mt-2">Laboratory Work #2: Computer Classification Neural Networks</p>
      </header>

      <main>
        <NetworkDashboard />
      </main>
    </div>
  );
}

export default App;
