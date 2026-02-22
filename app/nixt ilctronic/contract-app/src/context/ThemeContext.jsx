import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const THEMES = {
  teal: {
    name: 'تركوازي',
    key: 'teal',
    accent: '#14b8a6',
    accentLight: '#2dd4bf',
    accentDark: '#0d9488',
    accentLighter: '#5eead4',
    accentRgb: '20, 184, 166',
  },
  gold: {
    name: 'ذهبي',
    key: 'gold',
    accent: '#c9a84c',
    accentLight: '#e8cf7a',
    accentDark: '#a88b32',
    accentLighter: '#f5e2a0',
    accentRgb: '201, 168, 76',
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem('nixt-theme') || 'teal';
  });

  const theme = THEMES[themeKey];

  useEffect(() => {
    const root = document.documentElement;
    if (themeKey === 'gold') {
      root.setAttribute('data-theme', 'gold');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('nixt-theme', themeKey);
  }, [themeKey]);

  const toggleTheme = useCallback(() => {
    setThemeKey((prev) => (prev === 'teal' ? 'gold' : 'teal'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeKey, toggleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export { THEMES };
export default ThemeContext;
