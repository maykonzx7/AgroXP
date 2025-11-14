// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  theme: string;
  toggleDarkMode: () => void;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setThemeState] = useState('green');

  // Carregar configurações salvas do localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedTheme = localStorage.getItem('theme');

    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  // Aplicar mudanças de tema
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Remover todas as classes de tema anteriores
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
    
    // Adicionar a nova classe de tema
    if (theme) {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  const value = {
    darkMode,
    theme,
    toggleDarkMode,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export default ThemeContext;