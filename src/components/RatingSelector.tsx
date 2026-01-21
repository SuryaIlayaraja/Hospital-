import React from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RatingSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const SmileyIcon = ({ color, type }: { color: string; type: 'excellent' | 'good' | 'average' }) => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-sm">
    <circle cx="50" cy="50" r="45" fill={color} stroke="black" strokeWidth="2.5" />
    <ellipse cx="35" cy="40" rx="5" ry="10" fill="black" />
    <ellipse cx="65" cy="40" rx="5" ry="10" fill="black" />
    {type === 'excellent' && (
      <path d="M25 60 Q50 90 75 60" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
    )}
    {type === 'good' && (
      <path d="M30 65 Q50 80 70 65" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" />
    )}
    {type === 'average' && (
      <path d="M35 70 Q50 70 65 70" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" />
    )}
  </svg>
);

const RatingSelector: React.FC<RatingSelectorProps> = ({ label, value, onChange, required = false }) => {
  const { t } = useLanguage();
  const ratings = [
    { text: t('common.excellent'), type: 'excellent' as const, color: '#22c55e' }, // Green
    { text: t('common.good'), type: 'good' as const, color: '#eab308' },      // Yellow
    { text: t('common.average'), type: 'average' as const, color: '#ef4444' }     // Red
  ];

  return (
    <div className="border-b border-gray-800 py-6 last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="text-sm font-bold text-gray-300 flex-1">
          {label}
          {required && <span className="text-indigo-400 ml-1 font-bold">*</span>}
        </label>
        
        <div className="flex gap-3">
          {ratings.map((rating) => (
            <label key={rating.text} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name={label}
                value={rating.text}
                checked={value === rating.text}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
                required={required}
              />
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  value === rating.text
                    ? rating.type === 'excellent'
                      ? 'bg-green-500/20 text-green-400 border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-105'
                      : rating.type === 'good'
                      ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-105'
                      : 'bg-red-500/20 text-red-400 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-105'
                    : 'bg-gray-800/50 text-gray-400 group-hover:bg-gray-700 active:scale-95 border border-gray-700'
                }`}
              >
                <SmileyIcon color={rating.color} type={rating.type} />
                <span className="hidden sm:inline">{rating.text}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingSelector;