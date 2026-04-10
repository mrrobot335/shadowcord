import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const defaultTheme = {
  primary: '#dc2626', primaryHover: '#b91c1c',
  bg1: '#111111', bg2: '#1a1a1a', bg3: '#222222', bg4: '#2a2a2a', bg5: '#333333',
  text1: '#ffffff', text2: '#b3b3b3', text3: '#888888', border: '#3a3a3a',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-hover', theme.primaryHover);
    root.style.setProperty('--color-bg-1', theme.bg1);
    root.style.setProperty('--color-bg-2', theme.bg2);
    root.style.setProperty('--color-bg-3', theme.bg3);
    root.style.setProperty('--color-bg-4', theme.bg4);
    root.style.setProperty('--color-bg-5', theme.bg5);
    root.style.setProperty('--color-text-1', theme.text1);
    root.style.setProperty('--color-text-2', theme.text2);
    root.style.setProperty('--color-text-3', theme.text3);
    root.style.setProperty('--color-border', theme.border);
  }, [theme]);

  const updateTheme = (newTheme) => {
    const updated = { ...theme, ...newTheme };
    setTheme(updated);
    localStorage.setItem('theme', JSON.stringify(updated));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.setItem('theme', JSON.stringify(defaultTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
