import React, { useState } from 'react';
import AudioUploader from './components/AudioUploader';
import ProgressTracker from './components/ProgressTracker';
import ResultsDashboard from './components/ResultsDashboard';

function App() {
  const [jobId, setJobId] = useState(null);
  const [statusObj, setStatusObj] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleUploadSuccess = (newJobId) => {
    setJobId(newJobId);
    setIsProcessing(true);
    setStatusObj({ status: 'Processing', message: 'Відправлено на сервер...', progress: 5 });
    
    // Connect to SSE
    const eventSource = new EventSource(`http://localhost:5000/api/status/${newJobId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatusObj(data);
      
      if (data.status === 'Completed' || data.status === 'Error') {
        eventSource.close();
        setIsProcessing(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setStatusObj(prev => ({ ...prev, status: 'Error', message: 'Втрачено з\'єднання з сервером' }));
      eventSource.close();
      setIsProcessing(false);
    };
  };

  const handleReset = () => {
    setJobId(null);
    setStatusObj(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-3">
            Аналізатор настрою аудіо
          </h1>
          <p className="text-xl text-gray-600">
            Завантажте запис, щоб розпізнати текст та оцінити емоційну тональність.
          </p>
        </div>

        {!jobId && !isProcessing && (
          <AudioUploader onUploadSuccess={handleUploadSuccess} />
        )}

        {(isProcessing || (statusObj && statusObj.status === 'Error')) && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 mb-8 transition-all">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Процес аналізу</h2>
            <ProgressTracker statusObj={statusObj} onReset={handleReset} />
          </div>
        )}

        {statusObj && statusObj.status === 'Completed' && statusObj.data && (
          <ResultsDashboard data={statusObj.data} onReset={handleReset} />
        )}

      </div>
    </div>
  );
}

export default App;
