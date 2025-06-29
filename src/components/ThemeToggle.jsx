import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { toggleTheme, isDark, theme } = useTheme();

  const handleClick = () => {
    console.log('🖱️ ThemeToggle clicked! Current state:', { theme, isDark });
    toggleTheme();
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Indicador de estado actual */}
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {isDark ? '🌙' : '☀️'} {theme}
      </span>
      
      <button
        onClick={handleClick}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out
          ${isDark ? 'bg-blue-600' : 'bg-gray-300'}
          hover:${isDark ? 'bg-blue-700' : 'bg-gray-400'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-800
        `}
        aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
        title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      >
        {/* Toggle circle */}
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out
            ${isDark ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
        
        {/* Icon inside toggle */}
        <span className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            <svg
              className="h-3 w-3 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-3 w-3 text-gray-600 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
              />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
} 