
import React from 'react';
import { NoteName, Tuning } from '../types';

interface StringSelectorProps {
  tuning: Tuning;
  activeStringKey: NoteName;
  onStringSelect: (stringKey: NoteName) => void;
}

export const StringSelector: React.FC<StringSelectorProps> = ({ tuning, activeStringKey, onStringSelect }) => {
  return (
    <div className="flex justify-center gap-2 sm:gap-4 w-full">
      {Object.entries(tuning).map(([key, { stringName }]) => {
        const isActive = key === activeStringKey;
        return (
          <button
            key={key}
            onClick={() => onStringSelect(key as NoteName)}
            className={`
              w-12 h-12 sm:w-14 sm:h-14 rounded-full text-xl sm:text-2xl font-bold 
              flex items-center justify-center transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500
              ${isActive
                ? 'bg-green-600 text-white shadow-lg scale-110'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            {stringName}
          </button>
        );
      })}
    </div>
  );
};
