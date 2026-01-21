import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProgressBarProps {
  progress: number;
  totalFields: number;
  completedFields: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, totalFields, completedFields }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-indigo-400" />
          <h3 className="text-xl font-bold text-gray-200">{t('progress.title')}</h3>
        </div>
        <div className="text-sm font-semibold text-indigo-400 bg-gray-900/50 px-3 py-1 rounded-full border border-indigo-500/30">
          {completedFields} {t('progress.completed')} {totalFields}
        </div>
      </div>
      
      <div className="w-full bg-gray-900/50 rounded-full h-4 mb-3 border border-gray-700">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm font-semibold text-gray-400">
        <span>0%</span>
        <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
          {Math.round(progress)}% {t('progress.complete')}
        </span>
        <span>100%</span>
      </div>
      
      {progress === 100 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-bold">{t('progress.ready')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
