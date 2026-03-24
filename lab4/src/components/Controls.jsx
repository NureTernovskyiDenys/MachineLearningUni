import React from 'react';
import { Play, Square, Shuffle, Trash2, Cpu, Activity, Info } from 'lucide-react';

const Controls = ({
  onSelectDigit,
  learningRule,
  setLearningRule,
  learningRate,
  setLearningRate,
  distortionPercent,
  setDistortionPercent,
  onDistort,
  onRecognize,
  onStop,
  onClear,
  onRunBenchmark,
  isRecognizing,
  isTrained,
  onTrain,
  accuracyLog
}) => {
  // Check if we have logs to show the accuracy
  const lastLog = accuracyLog.length > 0 ? accuracyLog[accuracyLog.length - 1] : null;

  return (
    <div className="flex flex-col gap-6 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl w-full max-w-md">
      
      {/* Навчання (Training Section) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          Налаштування Навчання
        </h3>
        
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Правило навчання:</label>
          <div className="flex bg-slate-900 rounded-lg p-1">
            <button
              disabled={isRecognizing}
              onClick={() => setLearningRule('hebb')}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${learningRule === 'hebb' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Хебба
            </button>
            <button
              disabled={isRecognizing}
              onClick={() => setLearningRule('projection')}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${learningRule === 'projection' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Проєкцій (Псевдоінверсія)
            </button>
          </div>
        </div>

        {learningRule === 'hebb' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-slate-400">Коефіцієнт навчання (η):</label>
              <span className="text-sm font-mono text-blue-400">{learningRate}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              disabled={isRecognizing}
              className="w-full accent-blue-500"
            />
          </div>
        )}

        <button
          onClick={onTrain}
          disabled={isRecognizing}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${isTrained ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
        >
          {isTrained ? 'Мережа Навчена (Перенавчити)' : 'Навчити Мережу'}
        </button>
      </div>

      <hr className="border-slate-700" />

      {/* Еталони (Patterns) */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200">Вибір Еталону (Цифри)</h3>
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
            <button
              key={digit}
              disabled={isRecognizing}
              onClick={() => onSelectDigit(digit)}
              className="bg-slate-700 hover:bg-blue-500 text-slate-200 py-2 rounded-md transition-colors font-mono font-bold"
            >
              {digit}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-700" />

      {/* Тестування (Testing Section) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Тестування та Спотворення</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-slate-400">Шум (Спотворення %):</label>
            <span className="text-sm font-mono text-orange-400">{distortionPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={distortionPercent}
            onChange={(e) => setDistortionPercent(parseInt(e.target.value))}
            disabled={isRecognizing}
            className="w-full accent-orange-500"
          />
          <button
            onClick={onDistort}
            disabled={isRecognizing}
            className="w-full flex justify-center items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg transition-colors"
          >
            <Shuffle className="w-4 h-4" /> Спотворити
          </button>
        </div>

        <div className="flex gap-2">
          {isRecognizing ? (
            <button
              onClick={onStop}
              className="flex-1 flex justify-center items-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg animate-pulse"
            >
              <Square className="w-5 h-5 fill-current" /> Зупинити
            </button>
          ) : (
            <button
              onClick={onRecognize}
              disabled={!isTrained}
              className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg"
            >
              <Play className="w-5 h-5 fill-current" /> Розпізнати
            </button>
          )}
          
          <button
            onClick={onClear}
            disabled={isRecognizing}
            className="flex-none p-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            title="Очистити поле"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      <hr className="border-slate-700" />

      {/* Дослідження (Benchmark) */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" /> Дослідження (Benchmark)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Автоматичний прогін: 100 тестів (цифри 0-9) для кожного рівня шуму (10-50%). Оцінюється здатність мережі відновити початковий еталон.
        </p>
        <button
          onClick={onRunBenchmark}
          disabled={isRecognizing || !isTrained}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded-lg font-medium transition-colors"
        >
          Run Benchmark
        </button>

        {accuracyLog.length > 0 && (
          <div className="mt-3 bg-slate-900 rounded-lg p-3 border border-slate-700 h-32 overflow-y-auto custom-scrollbar">
            <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase flex items-center gap-1">
              <Info className="w-3 h-3" /> Результати:
            </h4>
            <div className="space-y-1">
              {accuracyLog.map((log, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-slate-800 pb-1">
                  <span className="text-slate-300">Шум {log.noise}%</span>
                  <span className={`font-mono font-bold ${log.accuracy > 80 ? 'text-green-400' : log.accuracy > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {log.accuracy.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Controls;
