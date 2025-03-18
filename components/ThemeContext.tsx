// components/ThemeContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

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
};

export const darkTheme: Theme = {
  primary: '#1B2631',
  secondary: '#4A646C',
  background: '#212F3C',
  text: '#ECF0F1',
  inputBorder: '#5D6D7E',
  tableHeader: '#5D6D7E',
  tableRowBorder: '#566573',
  modalBackground: '#333',
  tableText: '#fff',
  titleText: '#fff',
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
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
