
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const langCode = event.target.value;
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
    onLanguageChange(lang);
  };
  
  return (
    <div className="w-full sm:w-auto">
      <select
        value={selectedLanguage.code}
        onChange={handleChange}
        className="w-full bg-slate-700 border border-slate-600 text-white text-md rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3"
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
