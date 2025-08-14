import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MUIProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

const lightMui = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0ea5e9' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#111111', secondary: '#666666' }
  }
});

const darkMui = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#38bdf8' },
    background: { default: '#0b0b0f', paper: '#111216' },
    text: { primary: '#e6e6e6', secondary: '#a1a1a1' }
  }
});

export function AppThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vibe-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('vibe-theme', theme);
  }, [theme]);

  const muiTheme = useMemo(() => (theme === 'dark' ? darkMui : lightMui), [theme]);
  const value = useMemo(() => ({
    theme,
    setTheme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <MUIProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MUIProvider>
    </ThemeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeContext);
