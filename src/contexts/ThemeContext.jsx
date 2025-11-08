import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Inicializar con null para evitar hydration mismatch
  const [theme, setTheme] = useState(null);

  // Función para detectar y aplicar el tema inicial
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const htmlElement = document.documentElement;
    const hasDarkClass = htmlElement.classList.contains('dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    console.log('🎨 Inicializando tema:', {
      savedTheme,
      hasDarkClass,
      prefersDark
    });

    let initialTheme = 'light';

    // Prioridad: 1) Tema guardado, 2) Clase actual del DOM, 3) Preferencia del sistema
    if (savedTheme === 'dark' || savedTheme === 'light') {
      initialTheme = savedTheme;
    } else if (hasDarkClass) {
      initialTheme = 'dark';
    } else if (prefersDark) {
      initialTheme = 'dark';
    }

    console.log('🎯 Tema inicial seleccionado:', initialTheme);
    
    // Aplicar al DOM y estado
    if (initialTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', initialTheme);
    setTheme(initialTheme);
  };

  // Inicializar cuando el componente se monta
  useEffect(() => {
    initializeTheme();
    
    // Observer para detectar cambios externos en las clases del HTML
    const observer = new MutationObserver(() => {
      const htmlElement = document.documentElement;
      const hasDarkClass = htmlElement.classList.contains('dark');
      const currentTheme = hasDarkClass ? 'dark' : 'light';
      
      // Solo actualizar si hay desincronización
      if (theme && theme !== currentTheme) {
        console.log('🔄 Sincronizando tema desde DOM:', currentTheme);
        setTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [theme]);

  const toggleTheme = () => {
    if (!theme) return; // No hacer nada si aún no se ha inicializado
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🔄 Cambiando tema de', theme, 'a', newTheme);
    
    const htmlElement = document.documentElement;
    
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  // Función para sincronizar manualmente
  const syncTheme = () => {
    const htmlElement = document.documentElement;
    const hasDarkClass = htmlElement.classList.contains('dark');
    const domTheme = hasDarkClass ? 'dark' : 'light';
    
    console.log('🔧 Sincronización manual:', { domTheme, reactTheme: theme });
    
    setTheme(domTheme);
    localStorage.setItem('theme', domTheme);
  };

  const value = {
    theme: theme || 'light', // Fallback a 'light' si aún es null
    toggleTheme,
    syncTheme,
    isDark: theme === 'dark',
    isInitialized: theme !== null
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 