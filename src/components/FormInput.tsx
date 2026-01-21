import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  className = ""
}) => {
  const { t } = useLanguage();
  
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-bold text-gray-300">
        {label}
        {required && <span className="text-indigo-400 ml-1 font-bold">{t('common.required')}</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-white placeholder-gray-500"
      />
    </div>
  );
};

export default FormInput;