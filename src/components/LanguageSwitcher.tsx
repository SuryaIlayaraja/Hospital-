import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = (langCode: 'en' | 'ta') => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2 transition-all duration-300 transform"
        title="Select Language"
      >
        <Globe className="h-4 w-4 text-white" />
        <span className="text-sm font-bold">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown className={`h-4 w-4 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-2xl z-50 backdrop-blur-sm">
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as 'en' | 'ta')}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition-all duration-200 flex items-center justify-between rounded-lg mx-1 ${
                  language === lang.code ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-purple-700 hover:text-purple-900'
                }`}
              >
                <span className="font-bold">{lang.nativeName}</span>
                <span className={`text-xs ${language === lang.code ? 'text-purple-100' : 'text-purple-500'}`}>{lang.name}</span>
                {language === lang.code && (
                  <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
