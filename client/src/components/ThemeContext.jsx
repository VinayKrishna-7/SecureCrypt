import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  { id: 'dark', name: 'Dark', icon: 'Moon' },
  { id: 'bright', name: 'Bright', icon: 'Sun' },
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('securecrypt_theme') || localStorage.getItem('pastebox_theme');
      if (saved === 'dark' || saved === 'bright') {
        return saved;
      }
    } catch {
      // ignore localStorage errors
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'bright') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    try {
      localStorage.setItem('securecrypt_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'bright' : 'dark'));
  };

  const changeTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'bright') {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
