// components/ThemeContext.tsx
import React, { createContext, useState, ReactNode, useEffect } from 'react';

export type Theme = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  inputBorder: string;
  tableHeader: string;
  tableRowBorder: string;
  modalBackground: string;
  tableText: string;
  titleText: string;
  shadowColor: string;
  cardBackground: string;
  borderColor: string;
};

export const lightTheme: Theme = {
  primary: '#2E86C1',
  secondary: '#5DADE2',
  background: '#F0F8FF',
  text: '#333',
  inputBorder: '#AED6F1',
  tableHeader: '#AED6F1',
  tableRowBorder: '#D6EAF8',
  modalBackground: '#fff',
  tableText: '#2E86C1',
  titleText: '#000',
  shadowColor: 'rgba(46, 134, 193, 0.15)',
  cardBackground: '#ffffff',
  borderColor: '#E0E0E0',
};

export const darkTheme: Theme = {
  primary: '#1B2631',
  secondary: '#4A646C',
  background: '#212F3C',
  text: '#ECF0F1',
  inputBorder: '#5D6D7E',
  tableHeader: '#5D6D7E',
  tableRowBorder: '#566573',
  modalBackground: '#2C3E50',
  tableText: '#fff',
  titleText: '#fff',
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  cardBackground: '#2C3E50',
  borderColor: '#34495E',
};

export const oceanBreezeTheme: Theme = {
  primary: '#0077B6',
  secondary: '#00B4D8',
  background: '#CAF0F8',
  text: '#03045E',
  inputBorder: '#90E0EF',
  tableHeader: '#90E0EF',
  tableRowBorder: '#ADE8F4',
  modalBackground: '#d0efff',
  tableText: '#fff',
  titleText: '#000',
  shadowColor: 'rgba(0, 119, 182, 0.2)',
  cardBackground: '#ffffff',
  borderColor: '#90E0EF',
};

export const sunsetGlowTheme: Theme = {
  primary: '#D35400',
  secondary: '#E67E22',
  background: '#FDEBD0',
  text: '#4A235A',
  inputBorder: '#F5CBA7',
  tableHeader: '#F5CBA7',
  tableRowBorder: '#FAD7A0',
  modalBackground: '#ffe5d0',
  tableText: '#fff',
  titleText: '#000',
  shadowColor: 'rgba(211, 84, 0, 0.2)',
  cardBackground: '#ffffff',
  borderColor: '#F5CBA7',
};

export const purpleTheme: Theme = {
  primary: '#8E24AA',       // Rich purple
  secondary: '#AB47BC',     // Lighter purple
  background: '#F3E5F5',      // Very light purple background
  text: '#333',
  inputBorder: '#CE93D8',
  tableHeader: '#CE93D8',
  tableRowBorder: '#E1BEE7',
  modalBackground: '#fff',
  tableText: '#8E24AA',
  titleText: '#000',
  shadowColor: 'rgba(142, 36, 170, 0.2)',
  cardBackground: '#ffffff',
  borderColor: '#CE93D8',
};

export const greenTheme: Theme = {
  primary: '#388E3C',       // Rich green
  secondary: '#66BB6A',     // Lighter green
  background: '#E8F5E9',      // Very light green background
  text: '#333',
  inputBorder: '#A5D6A7',
  tableHeader: '#A5D6A7',
  tableRowBorder: '#C8E6C9',
  modalBackground: '#fff',
  tableText: '#388E3C',
  titleText: '#000',
  shadowColor: 'rgba(56, 142, 60, 0.2)',
  cardBackground: '#ffffff',
  borderColor: '#A5D6A7',
};

export const pinkTheme: Theme = {
  primary: '#E91E63',       // Vivid pink
  secondary: '#F06292',     // Lighter pink
  background: '#FCE4EC',      // Very light pink background
  text: '#333',
  inputBorder: '#F8BBD0',
  tableHeader: '#F8BBD0',
  tableRowBorder: '#F48FB1',
  modalBackground: '#fff',
  tableText: '#E91E63',
  titleText: '#000',
  shadowColor: 'rgba(233, 30, 99, 0.2)',
  cardBackground: '#ffffff',
  borderColor: '#F8BBD0',
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    root?.style.setProperty('--status-bar-color', theme.primary);
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.primary);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
