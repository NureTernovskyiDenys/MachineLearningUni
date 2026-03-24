import React, { useState, useRef } from 'react';

const AudioUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type.includes('audio') || selectedFile.name.match(/\.(mp3|wav|m4a|flac)$/i))) {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Будь ласка, оберіть коректний аудіофайл (MP3, WAV, M4A, FLAC)');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Помилка сервера. Спробуйте пізніше.');
      }

      const data = await response.json();
      if (data.jobId) {
        onUploadSuccess(data.jobId);
      }
    } catch (err) {
      console.error(err);
      setError('Не вдалося завантажити файл. Перевірте підключення до сервера або наявність запущеного бекенду.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 transition-all transform hover:shadow-2xl">
      <div 
        className="border-dashed border-4 border-indigo-200 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition-colors"
        onClick={() => fileInputRef.current.click()}
      >
        <svg className="w-16 h-16 text-indigo-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        <p className="text-xl font-medium text-gray-700 mb-2">Натисніть сюди або перетягніть файл</p>
        <p className="text-sm text-gray-500">Підтримуються формати: MP3, WAV, FLAC, M4A</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="audio/*"
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <div className="mt-6 flex items-center justify-between bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex items-center overflow-hidden">
            <svg className="w-8 h-8 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
            <span className="font-semibold text-gray-800 truncate">{file.name}</span>
          </div>
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className={`flex-shrink-0 ml-4 px-6 py-2 rounded-full font-bold text-white transition-colors flex items-center ${isUploading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Завантаження...
              </>
            ) : 'Відправити'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 text-center font-medium bg-red-50 p-4 rounded-lg border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
