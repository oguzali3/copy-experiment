// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default to system
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  });
  
  // Track if the theme is currently dark
  const [isDark, setIsDark] = useState<boolean>(false);
  
  useEffect(() => {
    // Function to update DOM based on theme
    const updateDOM = (darkMode: boolean) => {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setIsDark(darkMode);
    };
    
    // Set theme based on choice
    if (theme === 'system') {
      // Use system preference
      const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      updateDOM(systemDarkMode);
      
      // Add listener for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => updateDOM(e.matches);
      
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      // Use explicit setting
      updateDOM(theme === 'dark');
      // Save to localStorage
      localStorage.setItem('theme', theme);
    }
  }, [theme]);
  
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);