import React from 'react';

const ResultsDashboard = ({ data, onReset }) => {
  const { originalText, cleanedText, sentiment } = data;

  const getSentimentText = (score) => {
    if (score > 0.25) return { label: 'Позитивний', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' };
    if (score < -0.25) return { label: 'Негативний', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' };
    return { label: 'Нейтральний', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' };
  };

  const sentimentInfo = getSentimentText(sentiment.score);
  
  // Calculate percentage for progress bar (-1 to 1 mapped to 0 to 100)
  const scorePercent = ((sentiment.score + 1) / 2) * 100;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 transition-all animate-fade-in">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Результати аналізу</h2>
        <button 
          onClick={onReset}
          className="text-sm px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
        >
          Аналізувати інший файл
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`col-span-1 p-6 rounded-xl border ${sentimentInfo.border} ${sentimentInfo.bg} flex flex-col justify-center items-center text-center`}>
          <span className="text-sm text-gray-600 font-medium mb-1">Загальний настрій</span>
          <span className={`text-3xl font-extrabold ${sentimentInfo.color}`}>{sentimentInfo.label}</span>
          
          <div className="w-full mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Негатив</span>
              <span>Позитив</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-gray-400 to-green-500 relative w-full"
              >
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-gray-900 z-10"
                  style={{ left: `calc(${scorePercent}% - 2px)` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col justify-center">
            <span className="text-sm text-gray-500 font-medium pb-1">Sentiment Score</span>
            <span className="text-2xl font-bold text-gray-800">{sentiment.score.toFixed(2)}</span>
            <span className="text-xs text-gray-400 mt-1">від -1.0 до 1.0</span>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col justify-center">
            <span className="text-sm text-gray-500 font-medium pb-1">Сила емоції (Magnitude)</span>
            <span className="text-2xl font-bold text-gray-800">{sentiment.magnitude.toFixed(2)}</span>
            <span className="text-xs text-gray-400 mt-1">від 0.0 до +inf</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 ml-1">Розпізнаний текст</h3>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-gray-700 leading-relaxed overflow-y-auto max-h-60">
          {sentiment.sentences && sentiment.sentences.length > 0 ? (
            sentiment.sentences.map((s, i) => {
              const sColor = getSentimentText(s.score);
              return (
                <span 
                  key={i} 
                  className={`inline px-1 mx-0.5 rounded ${sColor.bg}`}
                  title={`Score: ${s.score.toFixed(2)}`}
                >
                  {s.text}{' '}
                </span>
              );
            })
          ) : (
            <p>{originalText || cleanedText || "Текст відсутній"}</p>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-1">* Кольором виділено тональність окремих речень</p>
      </div>

    </div>
  );
};

export default ResultsDashboard;
